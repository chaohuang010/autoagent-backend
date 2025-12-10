
export interface Product {
  id: string;
  title: string;
  price: number;
  sales: number;
  shopName: string;
  image: string;
  category: string;
  tags: string[];
  // Real sourcing fields
  link?: string;
  platform?: '1688' | 'TaoBao' | 'PDD' | 'Other';
  rating?: number;
  trend?: 'up' | 'stable' | 'down';
  reviewCount?: number;
  inventoryStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface SearchIntent {
  keyword: string;
  maxPrice?: number;
  minPrice?: number;
  sortBy: 'price_asc' | 'price_desc' | 'sales_desc' | 'relevance';
  filters?: SearchFilters;
  targetAudience?: string; 
}

export interface SearchFilters {
  dropshipping: boolean; 
  verified: boolean;     
  factory: boolean;      
}

export interface AgentLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'action';
}

export enum AgentPhase {
  IDLE = 'IDLE',
  PARSING_INTENT = 'PARSING_INTENT',
  BROWSING = 'BROWSING', 
  EXTRACTING = 'EXTRACTING',
  GENERATING_REPORT = 'GENERATING_REPORT',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export enum AgentMode {
  SOURCING = 'SOURCING', // 智能选品
  LISTING = 'LISTING',   // 上架优化
  MARKETING = 'MARKETING', // 营销推广
  CS = 'CS',             // 客服处理
  FAVORITES = 'FAVORITES' // 收藏夹
}

// --- API 配置相关 ---
export type ApiProvider = 'OPENAI' | 'GOOGLE';

export interface ApiConfig {
  provider: ApiProvider;
  apiKey: string;
}
