
import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export const ProfitCalculator: React.FC = () => {
  const [cost, setCost] = useState<number>(0);
  const [shipping, setShipping] = useState<number>(5);
  const [price, setPrice] = useState<number>(0);
  const [platformFeeRate, setPlatformFeeRate] = useState<number>(5); // Percentage
  
  const [profit, setProfit] = useState<number>(0);
  const [margin, setMargin] = useState<number>(0);

  useEffect(() => {
    const fee = price * (platformFeeRate / 100);
    const net = price - cost - shipping - fee;
    setProfit(net);
    setMargin(price > 0 ? (net / price) * 100 : 0);
  }, [cost, shipping, price, platformFeeRate]);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-4">
        <div className="p-2 bg-brand-500/20 rounded-lg text-brand-400">
          <Calculator size={20} />
        </div>
        <h3 className="font-bold text-slate-200">利润计算器</h3>
      </div>

      <div className="space-y-5">
        <div className="space-y-1">
          <label className="text-xs text-slate-400 font-medium ml-1">进货成本 (¥)</label>
          <div className="relative">
             <DollarSign size={14} className="absolute left-3 top-3 text-slate-500" />
             <input 
               type="number" 
               min="0"
               value={cost || ''} 
               onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
               className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-8 pr-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
               placeholder="0.00"
             />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400 font-medium ml-1">代发运费 (¥)</label>
          <div className="relative">
             <DollarSign size={14} className="absolute left-3 top-3 text-slate-500" />
             <input 
               type="number" 
               min="0"
               value={shipping || ''} 
               onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
               className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-8 pr-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
               placeholder="5.00"
             />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400 font-medium ml-1">预计售价 (¥)</label>
          <div className="relative">
             <DollarSign size={14} className="absolute left-3 top-3 text-slate-500" />
             <input 
               type="number" 
               min="0"
               value={price || ''} 
               onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
               className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-8 pr-3 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
               placeholder="0.00"
             />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400 font-medium ml-1">平台费率 (%)</label>
          <div className="flex items-center gap-2">
            <input 
              type="range" 
              min="0" 
              max="30" 
              value={platformFeeRate} 
              onChange={(e) => setPlatformFeeRate(parseFloat(e.target.value))}
              className="flex-grow h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <span className="text-xs font-mono text-slate-300 w-8 text-right">{platformFeeRate}%</span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-700/50 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">单件净利</span>
          <span className={`text-xl font-bold font-mono ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ¥{profit.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">利润率</span>
          <div className={`flex items-center gap-1 font-mono font-bold ${margin >= 20 ? 'text-green-400' : margin > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
            <TrendingUp size={14} />
            {margin.toFixed(1)}%
          </div>
        </div>
        
        {margin < 10 && profit > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-2 items-start">
            <AlertCircle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-yellow-200/80 leading-snug">
              利润率较低。建议寻找更低成本货源或提高售价以应对退货风险。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
