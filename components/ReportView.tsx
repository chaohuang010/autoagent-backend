import React from 'react';

interface ReportViewProps {
  markdown: string;
}

export const ReportView: React.FC<ReportViewProps> = ({ markdown }) => {
  // Simple "Markdown-ish" renderer to avoid external heavy deps for this demo
  // Handles headers (#), bullets (-), and bold (**).
  const lines = markdown.split('\n');

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-brand-500/30 rounded-xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-brand-500 opacity-50" />
        <h2 className="text-brand-400 font-mono text-sm mb-4 flex items-center gap-2 uppercase tracking-wider">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            任务简报 / 市场分析
        </h2>
        <div className="space-y-3 text-slate-300 leading-relaxed text-sm">
            {lines.map((line, i) => {
                if (line.startsWith('###')) {
                     return <h3 key={i} className="text-lg font-bold text-white mt-4">{line.replace('###', '')}</h3>;
                }
                if (line.startsWith('##')) {
                    return <h2 key={i} className="text-xl font-bold text-white mt-6 border-b border-slate-700 pb-2">{line.replace('##', '')}</h2>;
               }
                if (line.trim().startsWith('-')) {
                    const content = line.trim().substring(1);
                    return (
                        <div key={i} className="flex gap-2 ml-2">
                            <span className="text-brand-500 mt-1.5">•</span>
                            <span dangerouslySetInnerHTML={{__html: parseBold(content)}} />
                        </div>
                    );
                }
                if (line.trim() === '') return <br key={i}/>;
                
                return <p key={i} dangerouslySetInnerHTML={{__html: parseBold(line)}} />;
            })}
        </div>
    </div>
  );
};

// Helper for bold text (**text**)
const parseBold = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
};