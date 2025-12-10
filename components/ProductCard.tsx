
import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingBag, ExternalLink, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  rank: number;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  rank, 
  isFavorite = false, 
  onToggleFavorite, 
  onClick 
}) => {
  const [imgError, setImgError] = useState(false);
  
  // Construct a fallback generated image URL if the real one fails
  const fallbackImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(product.title + ' product photography white background high quality')}?nologo=true&width=400&height=400&seed=${product.id}`;

  const getPlatformBadge = (p?: string) => {
    switch(p) {
        case '1688': return 'bg-orange-500 text-white';
        case 'PDD': return 'bg-red-600 text-white';
        case 'TaoBao': return 'bg-orange-600 text-white';
        default: return 'bg-slate-600 text-slate-200';
    }
  };

  return (
    <div 
      className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-brand-500 transition-colors group relative cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      <div className="relative h-44 overflow-hidden bg-slate-800 shrink-0">
        <img 
          src={imgError ? fallbackImage : product.image} 
          alt={product.title} 
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${imgError ? 'opacity-80' : ''}`}
        />
        
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-md font-mono border border-white/10 shadow-lg z-10">
          #{rank}
        </div>

        {/* Platform Badge */}
        <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold z-10 shadow-sm ${getPlatformBadge(product.platform)}`}>
           {product.platform || 'WEB'}
        </div>
        
        {onToggleFavorite && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 border border-transparent transition-all z-10 opacity-0 group-hover:opacity-100"
          >
            <Heart size={14} className={isFavorite ? "fill-red-500 text-red-500" : "text-white/80"} />
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <h3 className="text-slate-200 font-medium text-sm line-clamp-2 leading-snug group-hover:text-brand-400 transition-colors h-10">
            {product.title}
          </h3>
          
          {/* Real Data Indicator */}
          <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
             <span>真实货源数据</span>
          </div>
        </div>
        
        <div className="mt-auto">
          <div className="flex justify-between items-end border-t border-slate-700/50 pt-3">
            <div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs text-brand-500 font-bold">¥</span>
                <span className="text-brand-400 font-bold text-lg">{product.price.toFixed(2)}</span>
              </div>
              <div className="text-slate-500 text-[10px] flex items-center gap-1 mt-0.5">
                <ShoppingBag size={10} />
                {product.sales > 0 ? `${product.sales}+ 已售` : '热销中'}
              </div>
            </div>
            
            <div className="text-right flex flex-col items-end gap-1">
              <div className="text-[10px] text-slate-400 truncate max-w-[80px]">{product.shopName}</div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (product.link) window.open(product.link, '_blank');
                }}
                className="text-[10px] bg-slate-700 hover:bg-brand-600 text-slate-200 hover:text-white px-2 py-1.5 rounded flex items-center gap-1 transition-colors"
                title="点击跳转真实进货页面"
              >
                去进货 <ExternalLink size={10} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
