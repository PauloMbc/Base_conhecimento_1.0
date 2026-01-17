
import React, { useMemo } from 'react';
import { ThemeMode } from '../types';

interface KnowledgeMapProps {
  theme: ThemeMode;
}

const LearningPath: React.FC<KnowledgeMapProps> = ({ theme }) => {
  const isDark = theme === ThemeMode.DARK;
  
  const steps = useMemo(() => [
    { id: '1', x: 50, y: 100, label: 'Word', icon: 'description', desc: 'Fundamentos da Escrita' },
    { id: '2', x: 150, y: 180, label: 'Excel', icon: 'table_view', desc: 'Artes Numéricas' },
    { id: '3', x: 250, y: 100, label: 'PowerPoint', icon: 'present_to_all', desc: 'Projeções Visuais' },
    { id: '4', x: 350, y: 180, label: 'IA Tools', icon: 'psychology', desc: 'Sapiência Artificial' },
    { id: '5', x: 450, y: 100, label: 'Automação', icon: 'auto_fix_high', desc: 'Feitiços de Fluxo' },
  ], []);

  const primaryColor = isDark ? '#c5a47e' : '#671921';
  const lineColor = isDark ? 'rgba(197, 164, 126, 0.2)' : 'rgba(103, 25, 33, 0.2)';

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-black/10 ink-bleed p-4">
      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <svg viewBox="0 0 500 250" className="min-w-[600px] h-[200px]">
          {/* Path Line */}
          <path
            d="M 50 100 Q 100 140 150 180 T 250 100 T 350 180 T 450 100"
            fill="none"
            stroke={lineColor}
            strokeWidth="3"
            strokeDasharray="8 4"
          />
          
          {/* Steps */}
          {steps.map((step, i) => (
            <g key={step.id} className="cursor-pointer group">
              <circle
                cx={step.x}
                cy={step.y}
                r="22"
                fill={isDark ? '#1a0f0f' : '#ede5d6'}
                stroke={primaryColor}
                strokeWidth="2"
              />
              <foreignObject x={step.x - 12} y={step.y - 12} width="24" height="24">
                <span className={`material-symbols-outlined text-[20px] flex items-center justify-center ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>
                  {step.icon}
                </span>
              </foreignObject>
              
              <text
                x={step.x}
                y={step.y + 40}
                textAnchor="middle"
                className={`text-[12px] font-antique-display font-bold uppercase tracking-widest ${isDark ? 'fill-gold-faded' : 'fill-primary-light'}`}
              >
                {step.label}
              </text>
              <text
                x={step.x}
                y={step.y + 55}
                textAnchor="middle"
                className={`text-[9px] font-antique-serif italic ${isDark ? 'fill-gold-faded/40' : 'fill-primary-light/60'}`}
              >
                {step.desc}
              </text>
            </g>
          ))}
        </svg>
      </div>
      
      <div className="absolute top-4 left-4">
        <div className={`px-3 py-1 rounded-full backdrop-blur-md border ${isDark ? 'bg-black/40 border-gold-faded/20 text-gold-faded' : 'bg-white/40 border-primary-light/20 text-primary-light'} text-[10px] font-bold uppercase tracking-widest`}>
          Trilha Ativa: Mestria Digital
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
