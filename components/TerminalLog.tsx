import React, { useEffect, useRef } from 'react';
import { AgentLog } from '../types';
import { Terminal, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface TerminalLogProps {
  logs: AgentLog[];
}

export const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-full bg-terminal-bg rounded-lg border border-slate-700 overflow-hidden shadow-2xl font-mono text-sm h-64 flex flex-col">
      <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
        <Terminal size={16} className="text-slate-400" />
        <span className="text-slate-300 font-semibold text-xs">代理运行时日志 -- PLAYWRIGHT</span>
        <div className="flex-grow" />
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        </div>
      </div>
      <div className="p-4 overflow-y-auto flex-grow space-y-2">
        {logs.length === 0 && (
          <div className="text-slate-500 italic">等待系统指令...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 animate-fade-in">
            <span className="text-slate-500 text-xs shrink-0 pt-0.5">[{log.timestamp}]</span>
            <div className="flex items-center gap-2">
              {log.type === 'action' && <Clock size={14} className="text-blue-400" />}
              {log.type === 'success' && <CheckCircle size={14} className="text-green-400" />}
              {log.type === 'error' && <AlertCircle size={14} className="text-red-400" />}
              <span className={`
                ${log.type === 'action' ? 'text-blue-300' : ''}
                ${log.type === 'success' ? 'text-green-300' : ''}
                ${log.type === 'error' ? 'text-red-300' : ''}
                ${log.type === 'info' ? 'text-slate-300' : ''}
              `}>
                {log.message}
              </span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};