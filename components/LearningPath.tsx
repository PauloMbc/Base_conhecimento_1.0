
import React, { useMemo, useState } from 'react';
import { ThemeMode } from '../types';

interface KnowledgeMapProps {
  theme: ThemeMode;
  onStepClick: (label: string) => void;
}

const LearningPath: React.FC<KnowledgeMapProps> = ({ theme, onStepClick }) => {
  const isDark = theme === ThemeMode.DARK;
  const [isMaximized, setIsMaximized] = useState(false);
  
  const steps = useMemo(() => [
    { id: '1', x: 80, y: 100, label: 'Conceito inicial', icon: 'info', color: '#0091d5' },
    { id: '2', x: 200, y: 150, label: 'Gestão de Tarefas', icon: 'task_alt', color: '#a60084' },
    { id: '3', x: 320, y: 80, label: 'Word', icon: 'description', color: '#a5a5a5' },
    { id: '4', x: 440, y: 130, label: 'Excel', icon: 'table_chart', color: '#84bd00' },
  ], []);

  const lineColor = isDark ? 'rgba(197, 164, 126, 0.2)' : 'rgba(103, 25, 33, 0.2)';

  const toggleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMaximized(!isMaximized);
  };

  const renderSVG = (fullSize: boolean = false) => (
    <svg 
      viewBox="0 0 520 220" 
      className={`${fullSize ? 'w-full h-auto max-w-4xl' : 'min-w-[540px] h-full'}`} 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Linha do Destino */}
      <path
        d="M 80 100 C 140 100, 140 150, 200 150 S 260 80, 320 80 S 380 130, 440 130"
        fill="none"
        stroke={lineColor}
        strokeWidth="3"
        strokeDasharray="10,8"
        className="animate-dash"
      />
      
      {/* Nós de Conhecimento */}
      {steps.map((step) => (
        <g 
          key={step.id} 
          className="cursor-pointer group" 
          onClick={() => {
            onStepClick(step.label);
            if (isMaximized) setIsMaximized(false);
          }}
        >
          <circle
            cx={step.x}
            cy={step.y}
            r="22"
            fill={isDark ? '#0a0505' : '#ede5d6'}
            stroke={step.color}
            strokeWidth="3"
            className="transition-all duration-500 group-hover:r-[26px] group-hover:fill-opacity-10"
          />
          
          <foreignObject x={step.x - 12} y={step.y - 12} width="24" height="24">
            <div className="flex items-center justify-center w-full h-full pointer-events-none">
              <span className={`material-symbols-outlined !text-[20px] transition-all duration-500 group-hover:scale-125`} style={{ color: step.color }}>
                {step.icon}
              </span>
            </div>
          </foreignObject>
          
          <text
            x={step.x}
            y={step.y + 48}
            textAnchor="middle"
            className={`text-[9px] font-antique-display font-bold uppercase tracking-[0.1em] transition-all duration-500 group-hover:translate-y-1 ${isDark ? 'fill-gold-faded' : 'fill-primary-light'}`}
          >
            {step.label}
          </text>
        </g>
      ))}
    </svg>
  );

  return (
    <div className="relative w-full select-none ink-bleed mt-2">
      {/* MOBILE: Botão Minimizado */}
      <div className="md:hidden px-2">
        <button 
          onClick={toggleMaximize}
          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all active:scale-[0.98] shadow-sm
            ${isDark ? 'bg-gold-faded/5 border-gold-faded/20 text-gold-faded' : 'bg-primary-light/5 border-primary-light/20 text-primary-light'}`}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined !text-xl opacity-60">map</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Trilha de Mestria</span>
          </div>
          <span className="material-symbols-outlined !text-xl opacity-40">open_in_full</span>
        </button>
      </div>

      {/* DESKTOP: Exibição Normal (Visível) */}
      <div className={`hidden md:block relative w-full overflow-hidden h-[240px]`}>
        <div className="overflow-x-auto scrollbar-hide h-full cursor-grab active:cursor-grabbing">
          {renderSVG()}
        </div>
      </div>

      {/* OVERLAY MAXIMIZADO (Ambas Plataformas ao Clicar) */}
      {isMaximized && (
        <div 
          className={`fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-2xl transition-all duration-500 bg-black/85`}
          onClick={() => setIsMaximized(false)}
        >
          <div 
            className={`relative w-full max-w-5xl rounded-3xl border shadow-[0_0_60px_rgba(0,0,0,0.6)] p-6 md:p-12 animate-in zoom-in-95 duration-300 ${isDark ? 'bg-[#0a0505] border-gold-faded/20' : 'parchment-texture border-primary-light/20'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 z-[310]">
              <button 
                onClick={() => setIsMaximized(false)}
                className={`p-3 rounded-full transition-all hover:rotate-90 active:scale-90 ${isDark ? 'text-gold-faded hover:bg-gold-faded/10' : 'text-primary-light hover:bg-primary-light/10'}`}
              >
                <span className="material-symbols-outlined !text-3xl">close</span>
              </button>
            </div>

            <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
              <h3 className={`mb-10 font-antique-display text-xl md:text-3xl font-bold uppercase tracking-[0.4em] text-center ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>
                Trilha de Sabedoria Arcana
              </h3>
              <div className="w-full flex justify-center overflow-x-auto scrollbar-hide">
                {renderSVG(true)}
              </div>
              <p className={`mt-8 text-[10px] uppercase tracking-widest opacity-40 text-center ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>
                Toque nos glifos para acessar os anais
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
        .animate-dash {
          stroke-dashoffset: 0;
          animation: dash 25s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LearningPath;
