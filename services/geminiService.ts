import { GoogleGenAI, Type } from "@google/genai";
import { SearchIntent, Product, AgentMode } from "../types";

const getGoogleClient = () => {
  // 兼容两种环境：
  // 1. process.env.API_KEY (云端/Node环境)
  // 2. import.meta.env.VITE_API_KEY (本地 Vite 开发环境)
  const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY;
  
  if (!apiKey) {
    console.error("API Key is missing. Please set VITE_API_KEY in your .env file.");
  }
  
  return new GoogleGenAI({ apiKey: apiKey });
};

// --- 增强版重试机制 ---
async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 5, baseDelay = 1000): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // 检查是否为临时性服务端错误 (503 Overloaded, 500 Internal, 502 Bad Gateway, 504 Timeout, 429 Rate Limit)
      const status = error.status || error.code;
      const msg = (error.message || '').toLowerCase();
      const isRetryable = 
        status === 503 || status === 500 || status === 502 || status === 504 || status === 429 ||
        msg.includes('overloaded') || msg.includes('unavailable') || msg.includes('too many requests');
      
      if (isRetryable && i < maxRetries - 1) {
        // 指数退避 + 随机抖动，避免并发冲突
        const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
        console.warn(`Gemini API busy (${status}). Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

// 图片链接标准化
const normalizeImageUrl = (url?: string, title?: string) => {
    if (!url) return `https://image.pollinations.ai/prompt/${encodeURIComponent(title || 'product')}?nologo=true`;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('http')) return url;
    return url;
};

// 简单缓存
const cache = new Map<string, any>();

// 1. 解析用户意图 (带离线降级)
export const parseUserIntent = async (userQuery: string): Promise<SearchIntent> => {
  const cacheKey = `intent:GOOGLE:${userQuery}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const ai = getGoogleClient();
    const response = await retryOperation(() => ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `提取意图JSON: "${userQuery}"`,
      config: {
        systemInstruction: "你是电商意图分析专家。如果用户提到'100元左右'，设置minPrice=80, maxPrice=120。提到'便宜'设sortBy='price_asc'。提到'热销'设sortBy='sales_desc'。默认'relevance'。",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keyword: { type: Type.STRING },
            maxPrice: { type: Type.NUMBER, nullable: true },
            minPrice: { type: Type.NUMBER, nullable: true },
            sortBy: { type: Type.STRING, enum: ["price_asc", "price_desc", "sales_desc", "relevance"] },
          }
        }
      }
    }));
    
    const result = JSON.parse(response.text || "{}");
    if (!result.sortBy) result.sortBy = 'relevance';
    cache.set(cacheKey, result);
    return result;

  } catch (error) {
    console.error("Intent Error:", error);
    // 降级策略: 简单的关键词提取
    return { keyword: userQuery, sortBy: 'relevance' };
  }
};

// 2. 执行真实搜索 (三级兜底: Live Search -> AI Gen -> Hardcoded)
export const performRealSearch = async (intent: SearchIntent): Promise<Product[]> => {
  const ai = getGoogleClient();
  let products: Product[] = [];
  
  // Level 1: Google Search Grounding
  try {
    const searchQuery = `"${intent.keyword}" 批发 价格 ${intent.minPrice || ''} ${intent.maxPrice || ''} (1688 OR 淘宝 OR 拼多多)`;
    const prompt = `提取 5 个商品。JSON格式: [{title, price(number), shopName, platform(1688/TaoBao/PDD), link, sales(number), tags[]}]`;

    const response = await retryOperation(() => ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Query: ${searchQuery}\n${prompt}`,
      config: { tools: [{ googleSearch: {} }] },
    }));

    const text = response.text || "";
    // 提取 JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
        products = JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error("Level 1 Search Failed:", error);
  }

  // Level 2: AI Generation Fallback (如果搜索失败或为空)
  if (!products || products.length === 0) {
     console.log("Entering Level 2: AI Generation");
     try {
        const fallbackPrompt = `
            作为电商专家，推荐 5 款 "${intent.keyword}"。
            价格: ${intent.minPrice || 0}-${intent.maxPrice || '不限'}。
            JSON数组返回: [{title, price, shopName: "推荐工厂", platform: "1688", sales: 1000, tags: ["热销"]}]
        `;
        const fallbackResponse = await retryOperation(() => ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: fallbackPrompt,
            config: { responseMimeType: "application/json" }
        }));
        products = JSON.parse(fallbackResponse.text || "[]");
     } catch (e) {
         console.error("Level 2 Gen Failed:", e);
     }
  }

  // Level 3: Hardcoded Mock Data (如果 AI 也挂了 - 彻底离线兜底)
  if (!products || products.length === 0) {
      console.warn("Entering Level 3: Hardcoded Fallback");
      products = Array.from({ length: 4 }).map((_, i) => ({
          id: `offline-${Date.now()}-${i}`,
          title: `【演示数据】${intent.keyword} - 热门推荐款式 ${i+1} (网络繁忙)`,
          price: (intent.minPrice || 10) + (i * 15),
          shopName: '系统演示工厂店',
          platform: '1688',
          link: '#',
          image: '', // Will be handled by normalizer
          sales: 500 + i * 100,
          tags: ['网络拥堵', '自动推荐'],
          category: '演示'
      }));
  }

  // 数据清洗
  return products.map((p: any) => ({
      ...p,
      id: p.id || Math.random().toString(36).substr(2, 9),
      platform: p.platform || '1688',
      image: normalizeImageUrl(p.image, p.title || intent.keyword),
      link: p.link || `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(intent.keyword)}`,
      price: Number(p.price) || 0,
      sales: Number(p.sales) || 100,
      tags: p.tags || ['推荐']
  })).filter(p => p.title); 
};

// 3. 生成简报 (带离线降级)
export const generateShoppingReport = async (intent: SearchIntent, products: Product[]): Promise<string> => {
  try {
    const dataStr = JSON.stringify(products.slice(0, 5).map(p => ({ t: p.title, p: p.price })));
    const ai = getGoogleClient();
    const response = await retryOperation(() => ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `生成Markdown简报。关键词:${intent.keyword}。数据:${dataStr}。分析价格区间、利润空间和建议。`
    }));
    return response.text || "";
  } catch (error) {
    // 本地生成简报兜底
    const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / (products.length || 1);
    return `
### 📉 市场快速简报 (离线模式)
由于 AI 服务繁忙，以下是基于数据的自动统计：

- **搜索关键词**: ${intent.keyword}
- **获取商品数**: ${products.length} 个
- **平均成本**: ¥${avgPrice.toFixed(2)}

**建议**: 建议直接点击商品卡片跳转源头网站查看最新实时价格。
    `;
  }
};

// 4. 创意内容
export const generateCreativeContent = async (mode: AgentMode, userInput: string): Promise<string> => {
  try {
    const ai = getGoogleClient();
    const response = await retryOperation(() => ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: userInput,
      config: { systemInstruction: "电商文案专家" }
    }));
    return response.text || "";
  } catch (error) {
    return "❌ 服务繁忙，请稍后重试生成文案。";
  }
};