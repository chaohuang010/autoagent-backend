
import React from 'react';
import { AgentMode } from '../types';
import { ShoppingCart, Edit3, Video, MessageCircle, Heart, Bot } from 'lucide-react';

interface SidebarProps {
  currentMode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
  favoritesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange, favoritesCount }) => {
  const menuItems = [
    { id: AgentMode.SOURCING, label: '智能选品', icon: ShoppingCart },
    { id: AgentMode.LISTING, label: '上架优化', icon: Edit3 },
    { id: AgentMode.MARKETING, label: '营销推广', icon: Video },
    { id: AgentMode.CS, label: '金牌客服', icon: MessageCircle },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-800">
        <Bot className="text-white" size={20} />
        <span className="font-bold text-lg text-white">AutoAgent</span>
      </div>

      <div className="flex-grow py-6 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onModeChange(item.id)}
            className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 ${
              currentMode === item.id ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <item.icon size={18} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
        
        <div className="my-4 border-t border-slate-800 mx-3" />
        
        <button
            onClick={() => onModeChange(AgentMode.FAVORITES)}
            className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 ${
              currentMode === AgentMode.FAVORITES ? 'bg-slate-800 text-brand-400' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Heart size={18} />
            <span className="text-sm">我的收藏 ({favoritesCount})</span>
        </button>
      </div>
    </div>
  );
};
