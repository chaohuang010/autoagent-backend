
import React from 'react';
import { SearchIntent } from '../types';
import { Target, Banknote, ArrowUpDown, Layers } from 'lucide-react';

interface IntentCardProps {
  intent: SearchIntent;
}

export const IntentCard: React.FC<IntentCardProps> = ({ intent }) => {
  const getSortLabel = (sort: string) => {
    switch (sort) {
      case 'price_asc': return '价格最低优先';
      case 'price_desc': return '价格最高优先';
      case 'sales_desc': return '销量优先';
      default: return '智能综合排序';
    }
  };

  return (
    <div className="w-full bg-slate-800/60 backdrop-blur-sm border border-brand-500/40 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in shadow-lg shadow-brand-900/20 relative overflow-hidden group">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-brand-500/20 transition-all duration-700"></div>

      {/* Main Target */}
      <div className="flex items-center gap-4 z-10 min-w-[200px]">
        <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center border border-brand-500/30 text-brand-400">
          <Target size={24} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-brand-500 font-bold mb-0.5">TARGET / 目标商品</div>
          <div className="text-xl font-bold text-white tracking-tight">{intent.keyword}</div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="flex flex-wrap gap-3 md:gap-6 z-10 border-t md:border-t-0 md:border-l border-slate-700/50 pt-3 md:pt-0 md:pl-6">
        
        {/* Budget */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-slate-700/50 text-slate-400">
            <Banknote size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">预算范围</div>
            <div className="text-sm font-mono text-slate-200">
              {intent.minPrice ? `¥${intent.minPrice}` : '¥0'} - {intent.maxPrice ? `¥${intent.maxPrice}` : '∞'}
            </div>
          </div>
        </div>

        {/* Strategy */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-slate-700/50 text-slate-400">
            <ArrowUpDown size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">排序策略</div>
            <div className="text-sm font-mono text-slate-200">
              {getSortLabel(intent.sortBy)}
            </div>
          </div>
        </div>
        
        {/* Status Tag */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono ml-auto">
          <Layers size={12} />
          <span>INTENT_LOCKED</span>
        </div>

      </div>
    </div>
  );
};
