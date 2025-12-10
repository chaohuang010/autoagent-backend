
import React, { useState } from 'react';
import { Product } from '../types';
import { X, ShoppingBag, Heart, Share2, Tag, Truck, ShieldCheck, Star, ExternalLink } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product, 
  isOpen, 
  onClose,
  isFavorite,
  onToggleFavorite
}) => {
  const [imgError, setImgError] = useState(false);
  
  if (!isOpen) return null;

  const fallbackImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(product.title + ' product photography white background high quality')}?nologo=true&width=800&height=800&seed=${product.id}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors backdrop-blur-sm"
        >
          <X size={20} />
        </button>

        <div className="w-full md:w-1/2 bg-slate-800 relative group flex items-center justify-center overflow-hidden">
          <img 
            src={imgError ? fallbackImage : product.image} 
            alt={product.title}
            onError={() => setImgError(true)} 
            className="w-full h-full object-cover min-h-[300px] md:min-h-full"
          />
          <div className="absolute top-4 left-4 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {product.platform || '全网精选'}
          </div>
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col max-h-[80vh] overflow-y-auto bg-slate-900">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-medium rounded border border-slate-700">
                {product.category || '精选商品'}
              </span>
              <div className="flex items-center gap-1 text-yellow-500 text-xs">
                <Star size={12} fill="currentColor" />
                <span>{product.rating || 4.8}</span>
                <span className="text-slate-600 mx-1">|</span>
                <span className="text-slate-400">月销 {product.sales}+</span>
              </div>
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-white leading-tight mb-4">{product.title}</h2>
            
            <div className="flex items-end justify-between border-b border-slate-800 pb-5">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-brand-500 font-bold mb-1">¥</span>
                <span className="text-4xl font-bold text-brand-400 leading-none">{product.price.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <span className="block text-xs text-slate-500 mb-0.5">店铺</span>
                <span className="text-sm font-medium text-slate-300">{product.shopName}</span>
              </div>
            </div>
          </div>

          <div className="space-y-5 mb-8 flex-grow">
            <div className="flex flex-wrap gap-2">
              {product.tags && product.tags.length > 0 ? product.tags.map((tag, idx) => (
                <span key={idx} className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full">
                  <Tag size={10} className="text-brand-500" /> {tag}
                </span>
              )) : (
                 <span className="text-xs text-slate-500 italic">暂无标签</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-slate-400">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/30">
                <Truck size={16} className="text-brand-500" />
                <span>24h 发货</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/30">
                <ShieldCheck size={16} className="text-green-500" />
                <span>平台担保</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-auto pt-4 border-t border-slate-800">
            <button 
              onClick={onToggleFavorite}
              className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
                isFavorite 
                  ? 'bg-red-500/10 border-red-500/50 text-red-500' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
              }`}
            >
              <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <button 
               onClick={() => product.link && window.open(product.link, '_blank')}
               className="flex-grow bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20 transform active:scale-[0.98]"
            >
              <ExternalLink size={18} />
              去 {product.platform || '平台'} 进货
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
