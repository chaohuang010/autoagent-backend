import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Database, Search, FileText, Globe, Bookmark, Sparkles, CheckCircle, Info, Send } from 'lucide-react';
import { AgentPhase, AgentLog, Product, SearchIntent, AgentMode } from './types';
import { parseUserIntent, generateShoppingReport, performRealSearch, generateCreativeContent } from './services/geminiService';
import { TerminalLog } from './components/TerminalLog';
import { ProductCard } from './components/ProductCard';
import { ReportView } from './components/ReportView';
import { IntentCard } from './components/IntentCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { Sidebar } from './components/Sidebar';
import { ProfitCalculator } from './components/ProfitCalculator';
import { supabase } from './lib/supabase';

// Simple Toast
const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl border border-brand-500/30 flex items-center gap-3 animate-fade-in-up z-[110]">
    <CheckCircle size={18} className="text-green-400" />
    <span className="font-medium text-sm">{message}</span>
  </div>
);

export default function App() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<AgentMode>(AgentMode.SOURCING);
  
  const [phase, setPhase] = useState<AgentPhase>(AgentPhase.IDLE);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [report, setReport] = useState<string>('');
  const [currentIntent, setCurrentIntent] = useState<SearchIntent | null>(null);
  
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const scrollViewportRef = useRef<HTMLDivElement>(null);

  // Load Favorites from Supabase
  useEffect(() => {
    const fetchFavorites = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (data) {
        setFavorites(data.map((item: any) => ({
           id: item.id,
           title: item.title,
           price: item.price,
           sales: item.sales,
           shopName: item.shop_name,
           image: item.image,
           category: item.category,
           tags: item.tags || [],
           link: item.link,
           platform: item.platform,
           rating: item.rating,
           reviewCount: item.review_count,
           inventoryStatus: item.inventory_status
        })));
      }
    };
    fetchFavorites();
  }, []);

  // Toast Timer
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const addLog = (message: string, type: AgentLog['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }]);
  };

  const toggleFavorite = async (product: Product) => {
    if (!product) return;
    const isFav = favorites.some(p => p.id === product.id);
    
    // Optimistic UI
    if (isFav) {
      setFavorites(prev => prev.filter(p => p.id !== product.id));
      await supabase.from('products').delete().eq('id', product.id);
    } else {
      setFavorites(prev => [...prev, product]);
      await supabase.from('products').insert({
        id: product.id,
        title: product.title,
        price: product.price,
        sales: product.sales,
        shop_name: product.shopName,
        image: product.image,
        category: product.category,
        tags: product.tags,
        link: product.link,
        platform: product.platform,
        rating: product.rating,
        review_count: product.reviewCount,
        inventory_status: product.inventoryStatus
      });
      setToastMsg("已添加到收藏");
    }
  };

  const isFavorite = (product: Product) => product && favorites.some(p => p.id === product.id);

  const handleTask = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || phase !== AgentPhase.IDLE) return;

    setPhase(AgentPhase.PARSING_INTENT);
    setProducts([]);
    setReport('');
    setCurrentIntent(null);
    setLogs([]); // Clear logs for new task
    
    addLog(`任务开始: "${input}"`, 'action');

    try {
      if (mode === AgentMode.SOURCING) {
        addLog("正在解析需求...", 'info');
        const parsedIntent = await parseUserIntent(input);
        setCurrentIntent(parsedIntent);
        addLog(`锁定关键词: ${parsedIntent.keyword} (排序: ${parsedIntent.sortBy})`, 'success');
        
        setPhase(AgentPhase.BROWSING);
        addLog("正在执行实时搜索...", 'action');
        
        const foundProducts = await performRealSearch(parsedIntent);
        
        if (foundProducts.length === 0) {
          addLog("未找到结果，请检查关键词或 API 配额。", 'error');
          setPhase(AgentPhase.IDLE);
          return;
        }

        addLog(`搜索完成，获取 ${foundProducts.length} 条数据。`, 'success');
        setPhase(AgentPhase.EXTRACTING);
        setProducts(foundProducts);
        
        setPhase(AgentPhase.GENERATING_REPORT);
        addLog("正在生成分析简报...", 'action');
        const genReport = await generateShoppingReport(parsedIntent, foundProducts);
        setReport(genReport);
        addLog("任务完成。", 'success');
        
      } else {
        // Creative Modes
        addLog("正在生成内容...", 'action');
        setPhase(AgentPhase.GENERATING_REPORT);
        const content = await generateCreativeContent(mode, input);
        setReport(content);
        addLog("生成完成。", 'success');
      }

      setPhase(AgentPhase.COMPLETE);

    } catch (error: any) {
      console.error(error);
      addLog(`错误: ${error.message || '未知错误'}`, 'error');
      setPhase(AgentPhase.ERROR);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}

      <Sidebar 
        currentMode={mode} 
        onModeChange={setMode} 
        favoritesCount={favorites.length}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-slate-900 relative">
        {/* Header */}
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/95 backdrop-blur z-20">
           <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">AutoAgent Pro</span>
              <span className="text-[10px] bg-brand-900 text-brand-400 px-2 rounded border border-brand-800">REAL MODE</span>
           </div>
        </div>

        {/* Content */}
        <div ref={scrollViewportRef} className="flex-1 overflow-y-auto p-6 scroll-smooth pb-32">
           {mode === AgentMode.FAVORITES ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {favorites.length === 0 && <div className="col-span-2 text-center text-slate-500 py-10">暂无收藏商品</div>}
                 {favorites.map((p, i) => <ProductCard key={i} product={p} rank={i+1} isFavorite={true} onToggleFavorite={() => toggleFavorite(p)} />)}
              </div>
           ) : (
              <div className="space-y-6 max-w-4xl mx-auto">
                 {currentIntent && <IntentCard intent={currentIntent} />}
                 {logs.length > 0 && <TerminalLog logs={logs} />}
                 {products.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {products.map((p, i) => <ProductCard key={i} product={p} rank={i+1} isFavorite={isFavorite(p)} onToggleFavorite={() => toggleFavorite(p)} onClick={() => setSelectedProduct(p)} />)}
                    </div>
                 )}
                 {report && <ReportView markdown={report} />}
              </div>
           )}
        </div>

        {/* Input */}
        {mode !== AgentMode.FAVORITES && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent z-30">
            <div className="max-w-4xl mx-auto">
               <form onSubmit={handleTask} className="relative flex bg-slate-800 rounded-xl border border-slate-700 shadow-2xl">
                   <input
                     type="text"
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     disabled={phase !== AgentPhase.IDLE}
                     placeholder={mode === AgentMode.SOURCING ? "输入选品关键词 (如: 红色连衣裙 100元左右)..." : "输入生成指令..."}
                     className="flex-grow bg-transparent px-5 py-4 text-white focus:outline-none"
                   />
                   <button type="submit" disabled={phase !== AgentPhase.IDLE || !input.trim()} className="px-6 py-2 text-brand-400">
                     {phase !== AgentPhase.IDLE ? <Loader2 className="animate-spin" /> : <Send />}
                   </button>
               </form>
            </div>
          </div>
        )}
      </div>

      <div className="hidden xl:block w-80 bg-slate-900 border-l border-slate-800 p-4 shrink-0 z-20">
        <ProfitCalculator />
      </div>

      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          isOpen={!!selectedProduct} 
          onClose={() => setSelectedProduct(null)}
          isFavorite={isFavorite(selectedProduct)}
          onToggleFavorite={() => toggleFavorite(selectedProduct)}
        />
      )}
    </div>
  );
}
