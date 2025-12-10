
import React, { useState, useEffect } from 'react';
import { X, Key, Save, CheckCircle, Server, Globe } from 'lucide-react';
import { ApiConfig, ApiProvider } from '../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ApiConfig) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [provider, setProvider] = useState<ApiProvider>('GOOGLE');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const savedConfig = localStorage.getItem('app_api_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setProvider(parsed.provider || 'GOOGLE');
        setApiKey(parsed.apiKey || '');
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert("请输入有效的 API Key");
      return;
    }
    const config: ApiConfig = { provider, apiKey: apiKey.trim() };
    localStorage.setItem('app_api_config', JSON.stringify(config));
    onSave(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/20 rounded-lg text-brand-400">
              <Key size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">API 配置</h2>
              <p className="text-slate-500 text-xs">配置您的私有密钥以解锁完整功能</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">选择 AI 引擎</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setProvider('GOOGLE')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  provider === 'GOOGLE' 
                    ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-800/80'
                }`}
              >
                <Globe size={24} />
                <span className="font-bold">Google Gemini</span>
                <span className="text-[10px] opacity-70">联网搜索首选 (免费/付费)</span>
              </button>

              <button
                onClick={() => setProvider('OPENAI')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  provider === 'OPENAI' 
                    ? 'bg-green-500/10 border-green-500 text-green-400' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-800/80'
                }`}
              >
                <Server size={24} />
                <span className="font-bold">OpenAI GPT-4o</span>
                <span className="text-[10px] opacity-70">逻辑推理首选 (需付费Key)</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">API Key</label>
            <div className="relative">
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'GOOGLE' ? "AIzaSy..." : "sk-..."}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors font-mono text-sm"
              />
            </div>
            <p className="text-xs text-slate-500">
              Key 仅保存在您的浏览器本地，不会上传。
            </p>
          </div>

        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <button 
            onClick={handleSave}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Save size={18} />
            保存设置
          </button>
        </div>

      </div>
    </div>
  );
};
