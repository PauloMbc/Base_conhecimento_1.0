
import React, { useState } from 'react';
import { ThemeMode } from '../types';

interface TreeItem {
  id: string;
  label: string;
  color?: string;
  children?: TreeItem[];
}

interface ManuscriptTreeProps {
  theme: ThemeMode;
  onItemClick: (label: string) => void;
}

const ManuscriptTree: React.FC<ManuscriptTreeProps> = ({ theme, onItemClick }) => {
  const isDark = theme === ThemeMode.DARK;
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['dicas', 'gestao', 'office']));

  const treeData: TreeItem[] = [
    { id: 'conceito', label: 'Conceito inicial', color: '#0091d5' },
    { 
      id: 'dicas', 
      label: 'Dicas de Site', 
      children: [
        { 
          id: 'gestao', 
          label: 'Gestão de Tarefas', 
          children: [
            { id: 'monday', label: 'Monday', color: '#a60084' }
          ]
        }
      ] 
    },
    { 
      id: 'office', 
      label: 'Pacote Office', 
      children: [
        { id: 'excel', label: 'Excel', color: '#84bd00' },
        { id: 'word', label: 'Word', color: '#a5a5a5' }
      ] 
    }
  ];

  const toggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(expanded);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpanded(newSet);
  };

  const renderItem = (item: TreeItem, level: number) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expanded.has(item.id);
    const isSelected = item.label === 'Word'; // Simulação visual do foco da imagem enviada

    return (
      <div key={item.id} className="flex flex-col">
        <div 
          onClick={() => {
            if (!hasChildren) onItemClick(item.label);
          }}
          className={`flex items-center gap-2 py-1 px-2 rounded-sm transition-all cursor-pointer group
            ${isSelected ? (isDark ? 'bg-gold-faded/10' : 'bg-gray-200/60') : 'hover:bg-current/5'}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {/* Seta de expansão */}
          <div 
            className="w-4 h-4 flex items-center justify-center"
            onClick={(e) => hasChildren && toggle(item.id, e)}
          >
            {hasChildren && (
              <span className={`material-symbols-outlined !text-[14px] transition-transform duration-200 opacity-60 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                expand_more
              </span>
            )}
          </div>

          {/* Marcador Colorido (Pill vertical arredondada conforme a imagem) */}
          {item.color && (
            <div 
              className="w-[6px] h-[16px] rounded-full" 
              style={{ backgroundColor: item.color }}
            />
          )}

          <span className={`text-[13px] font-antique-serif tracking-tight whitespace-nowrap
            ${isDark ? 'text-gold-faded' : 'text-gray-800'}
            ${isSelected ? 'font-bold' : 'opacity-90 group-hover:opacity-100'}`}>
            {item.label}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="flex flex-col">
            {item.children!.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col py-2 select-none overflow-hidden">
      {treeData.map(item => renderItem(item, 0))}
    </div>
  );
};

export default ManuscriptTree;
