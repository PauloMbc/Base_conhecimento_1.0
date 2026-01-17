
import React, { useState, useEffect, useRef } from 'react';
import { ThemeMode, Manuscript } from './types';
import LearningPath from './components/LearningPath';
import ManuscriptTree from './components/ManuscriptTree';
import { generateArcaneInsights } from './services/geminiService';

const KNOWLEDGE_TAGS = ['Conceito inicial', 'Gestão de Tarefas', 'Word', 'Excel'];

const INITIAL_MANUSCRIPTS: Manuscript[] = [
  { id: '1', category: 'Alquimia', title: 'A Essência do Mercúrio Digital', content: '<b>Protocolo de Purificação:</b><br/>Para extrair a verdade dos dados brutos, deve-se primeiro filtrar as impurezas do ruído estático. O processo exige um resfriamento controlado dos servidores sob a luz da lua cheia, garantindo que a entropia não corrompa os registros sagrados...', timestamp: '3m atrás', status: 'Selo de Prata', isPinned: true, tags: ['Conceito inicial'] },
  { id: '2', category: 'Filosofia', title: 'O Vazio Entre os Códigos', content: 'Muitos buscam o poder na complexidade, mas a verdadeira maestria reside no espaço entre as linhas. O código que não é escrito é o mais resiliente de todos. <u>Minimalismo Arcano</u> é a chave para a longevidade de qualquer tomo digital...', timestamp: 'Out 2024', status: 'Ancestral', isFavorite: true, tags: ['Conceito inicial', 'Gestão de Tarefas'] },
  { id: '3', category: 'Estratégia', title: 'Defesas de Firewall Rúnico', content: 'Desenhe o círculo de proteção ao redor da porta 8080. Nenhum espírito malicioso passará pelo <i>token</i> de autenticação sagrado se as runas de criptografia estiverem devidamente alinhadas com as chaves de 256 bits.', timestamp: 'Lua Minguante', status: 'Protegido', tags: ['Excel'] },
  { id: '4', category: 'História', title: 'A Grande Queda dos Mainframes', content: 'Relatos fragmentados sobre a era em que os templos de silício frio foram abandonados em favor das nuvens etéreas. Os antigos mestres contam que o calor dissipado pelas máquinas era usado para aquecer as bibliotecas de dados físicos.', timestamp: 'Arquivado', status: 'Relíquia', tags: ['Word'] },
];

const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(ThemeMode.DARK);
  const [manuscripts, setManuscripts] = useState<Manuscript[]>(INITIAL_MANUSCRIPTS);
  const [isScribing, setIsScribing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('arquivos');
  const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const [newTitle, setNewTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const isDark = theme === ThemeMode.DARK;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = () => {
    setTheme(prev => prev === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK);
  };

  const execCmd = (cmd: string, value: string | undefined = undefined) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const insertTable = () => {
    const rows = window.prompt("Número de fileiras:", "2");
    const cols = window.prompt("Número de colunas:", "2");
    if (rows && cols) {
      let tableHtml = `<table style="width:100%; border-collapse: collapse; border: 1px solid currentColor; margin: 10px 0;">`;
      for (let i = 0; i < parseInt(rows); i++) {
        tableHtml += "<tr>";
        for (let j = 0; j < parseInt(cols); j++) {
          tableHtml += `<td style="border: 1px solid currentColor; padding: 8px;">...</td>`;
        }
        tableHtml += "</tr>";
      }
      tableHtml += "</table><br/>";
      execCmd('insertHTML', tableHtml);
    }
  };

  const handleInsertImage = () => {
    const url = window.prompt("Insira o link direto da imagem (URL):");
    if (url) {
      const imgHtml = `<img src="${url}" style="max-width: 100%; border-radius: 8px; margin: 10px 0; display: block; border: 1px solid rgba(128,128,128,0.2);" /><br/>`;
      execCmd('insertHTML', imgHtml);
    }
  };

  const toggleTagSelection = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const newManuscripts = [...manuscripts];
    const itemToMove = newManuscripts[draggedItemIndex];
    newManuscripts.splice(draggedItemIndex, 1);
    newManuscripts.splice(index, 0, itemToMove);
    setManuscripts(newManuscripts);
    setDraggedItemIndex(null);
  };

  const handleScribe = async () => {
    if (isScribing) return;
    setIsScribing(true);
    const manualContent = editorRef.current?.innerHTML || "";
    const titleToUse = newTitle || "Novo Fragmento de Sabedoria";
    if (activeTab === 'scriptor' && manualContent.trim().length > 10) {
      const manuscript: Manuscript = {
        id: Date.now().toString(),
        category: 'Original',
        title: titleToUse,
        content: manualContent,
        timestamp: 'Agora',
        status: 'Autoral',
        tags: selectedTags
      };
      setManuscripts(prev => [manuscript, ...prev]);
      if (editorRef.current) editorRef.current.innerHTML = '';
      setNewTitle('');
      setSelectedTags([]);
      setActiveTab('arquivos');
      setIsScribing(false);
      return;
    }
    const topic = newTitle || "Uma nova descoberta tecnológica misturada com magia";
    const newEntry = await generateArcaneInsights(topic);
    if (newEntry) {
      const manuscript: Manuscript = {
        id: Date.now().toString(),
        category: newEntry.category,
        title: newEntry.title,
        content: newEntry.content,
        timestamp: 'Agora',
        status: newEntry.metadata,
        tags: selectedTags
      };
      setManuscripts(prev => [manuscript, ...prev]);
      setNewTitle('');
      setSelectedTags([]);
      setActiveTab('arquivos');
    }
    setIsScribing(false);
  };

  const openManuscript = (m: Manuscript) => {
    setIsOpening(true);
    setSelectedManuscript(m);
  };

  const closeManuscript = () => {
    setIsOpening(false);
    setShowShareMenu(false);
    setTimeout(() => setSelectedManuscript(null), 400);
  };

  const getPlainContent = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n');
    return tmp.textContent || tmp.innerText || "";
  };

  const getFullShareText = (manuscript: Manuscript) => {
    const content = getPlainContent(manuscript.content);
    const tags = manuscript.tags && manuscript.tags.length > 0 ? `\n\nTags: #${manuscript.tags.join(' #')}` : '';
    const meta = `\n\nStatus: ${manuscript.status} | Data: ${manuscript.timestamp}`;
    return `${manuscript.title}\n\n${content}${tags}${meta}`;
  };

  const shareToEmail = () => {
    if (!selectedManuscript) return;
    const body = getFullShareText(selectedManuscript);
    window.location.href = `mailto:?subject=${encodeURIComponent(selectedManuscript.title)}&body=${encodeURIComponent(body)}`;
    setShowShareMenu(false);
  };

  const shareToWhatsApp = () => {
    if (!selectedManuscript) return;
    const text = `*${selectedManuscript.title}*\n\n${getPlainContent(selectedManuscript.content)}\n\n_Enviado via Códice_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareToKeep = async () => {
    if (!selectedManuscript) return;
    const text = getFullShareText(selectedManuscript);
    try {
      await navigator.clipboard.writeText(text);
      alert("O texto completo foi copiado! Redirecionando para o Google Keep...");
      window.open('https://keep.google.com/u/0/#create', '_blank');
    } catch (err) {
      alert("Erro ao copiar para área de transferência.");
    }
    setShowShareMenu(false);
  };

  const shareToNotion = async () => {
    if (!selectedManuscript) return;
    const text = `# ${selectedManuscript.title}\n\n${getPlainContent(selectedManuscript.content)}\n\n---\n*Status: ${selectedManuscript.status}*`;
    try {
      await navigator.clipboard.writeText(text);
      alert("Conteúdo formatado para Notion copiado! Cole em sua página do Notion.");
      window.open('https://notion.so', '_blank');
    } catch (err) {
      alert("Erro ao copiar para área de transferência.");
    }
    setShowShareMenu(false);
  };

  const handlePrint = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedManuscript) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-br">
        <head>
          <meta charset="UTF-8">
          <title>Códice: ${selectedManuscript.title}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=IM+Fell+English:ital@0;1&display=swap" rel="stylesheet">
          <style>
            @page { margin: 2cm; }
            body { 
              font-family: 'IM Fell English', serif; 
              padding: 40px; 
              background-color: #fdfaf0; 
              color: #2d0a0a; 
              line-height: 1.6; 
              max-width: 900px; 
              margin: 0 auto; 
            }
            .header-ornament { text-align: center; margin-bottom: 20px; opacity: 0.5; font-size: 24px; }
            .title { 
              font-family: 'Cinzel', serif; 
              font-size: 32px; 
              text-align: center; 
              border-bottom: 3px double #671921; 
              padding-bottom: 20px; 
              margin-bottom: 40px; 
              text-transform: uppercase; 
              letter-spacing: 0.15em; 
              color: #671921;
            }
            .content { font-size: 18px; text-align: justify; }
            .content p { margin-bottom: 1.5em; }
            .content img { 
              max-width: 80%; 
              height: auto; 
              display: block; 
              margin: 30px auto; 
              border: 1px solid #671921; 
              padding: 5px; 
              background: white;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
              border-radius: 4px;
            }
            blockquote { 
              border-left: 4px solid #671921; 
              padding: 10px 20px; 
              margin: 20px 0; 
              font-style: italic; 
              background: rgba(103, 25, 33, 0.05);
              border-radius: 0 8px 8px 0;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 30px 0; 
              font-size: 16px;
              background: white;
            }
            th, td { 
              border: 1px solid #671921; 
              padding: 12px; 
              text-align: left; 
            }
            th { 
              background-color: rgba(103, 25, 33, 0.1); 
              font-family: 'Cinzel', serif;
              font-size: 14px;
              text-transform: uppercase;
            }
            tr:nth-child(even) { background-color: rgba(103, 25, 33, 0.02); }
            
            .tags { margin-top: 40px; border-top: 1px dashed #671921; padding-top: 20px; }
            .tag { font-size: 13px; font-weight: bold; color: #671921; margin-right: 15px; text-transform: uppercase; }
            
            .meta { 
              margin-top: 60px; 
              border-top: 1px solid #ddd; 
              padding-top: 20px; 
              font-size: 13px; 
              opacity: 0.8; 
              display: flex; 
              justify-content: space-between; 
              font-style: italic; 
            }
            @media print { 
              body { background: white; padding: 0; } 
              .no-print { display: none; }
              .content img { border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="header-ornament">❦</div>
          <div class="title">${selectedManuscript.title}</div>
          <div class="content">${selectedManuscript.content}</div>
          ${selectedManuscript.tags?.length ? `
            <div class="tags">
              ${selectedManuscript.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
            </div>
          ` : ''}
          <div class="meta">
            <span>Categoria: ${selectedManuscript.category}</span>
            <span>Data: ${selectedManuscript.timestamp}</span>
            <span>Status: ${selectedManuscript.status}</span>
          </div>
          <script>
            window.onload = function() { 
              setTimeout(function() {
                window.print();
                // Opcional: fechar a janela após imprimir (alguns navegadores bloqueiam)
                // window.close(); 
              }, 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setShowShareMenu(false);
  };

  const togglePin = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setManuscripts(prev => prev.map(m => m.id === id ? { ...m, isPinned: !m.isPinned } : m));
    if (selectedManuscript?.id === id) {
      setSelectedManuscript(prev => prev ? {...prev, isPinned: !prev.isPinned} : null);
    }
  };

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setManuscripts(prev => prev.map(m => m.id === id ? { ...m, isFavorite: !m.isFavorite } : m));
    if (selectedManuscript?.id === id) {
      setSelectedManuscript(prev => prev ? {...prev, isFavorite: !prev.isFavorite} : null);
    }
  };

  const filteredManuscripts = [...manuscripts].filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory ? (m.category.toLowerCase().includes(activeCategory.toLowerCase()) || m.tags?.includes(activeCategory)) : true;
      return matchesSearch && matchesCategory;
  });

  const renderKanban = () => {
    const categories = ['Conceito inicial', 'Gestão de Tarefas', 'Word', 'Excel', 'Original'];
    return (
      <div className="flex gap-4 md:gap-5 overflow-x-auto pb-6 h-full custom-scrollbar animate-in fade-in duration-500 items-start no-print">
        {categories.map((cat) => (
          <div key={cat} className={`flex-shrink-0 w-64 md:w-72 rounded-xl border flex flex-col h-full shadow-sm transition-colors duration-300
            ${isDark ? 'bg-black/20 border-gold-faded/10' : 'bg-white/40 border-primary-light/10'}`}>
            <div className={`p-3 border-b border-current/10 flex items-center justify-between ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>
              <h3 className="font-antique-display text-[9px] font-bold uppercase tracking-[0.2em]">
                {cat}
              </h3>
              <span className="text-[8px] opacity-40 font-bold px-1.5 py-0.5 rounded-full border border-current/20">
                {manuscripts.filter(m => m.category === cat || m.tags?.includes(cat)).length}
              </span>
            </div>
            <div className="p-2 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-2.5">
              {manuscripts.filter(m => m.category === cat || m.tags?.includes(cat)).map((m) => (
                <div 
                  key={m.id} 
                  onClick={() => openManuscript(m)}
                  className={`p-3 rounded-lg border transition-all transform hover:shadow-md cursor-pointer group relative
                    ${isDark ? 'bg-[#1a1512] border-gold-faded/10 hover:border-gold-faded/40' : 'bg-[#ede5d6] border-primary-light/10 hover:border-primary-light/40'}`}>
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className={`text-[11px] font-bold leading-tight flex-1 ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>{m.title}</h4>
                  </div>
                  <div className={`text-[9px] italic line-clamp-2 opacity-60 leading-relaxed ${isDark ? 'text-gold-faded' : 'text-primary-light'}`} dangerouslySetInnerHTML={{ __html: m.content }} />
                  {m.tags && m.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {m.tags.map(t => (
                        <span key={t} className="text-[6px] uppercase font-bold tracking-widest opacity-40">#{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'arquivos':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 animate-in fade-in duration-500">
            {filteredManuscripts.length === 0 ? (
              <div className="col-span-full py-24 text-center opacity-40 italic font-antique-serif text-xl">Nenhum registro nos anais...</div>
            ) : filteredManuscripts.map((item, index) => (
              <div key={item.id} 
                draggable="true"
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                onClick={() => openManuscript(item)}
                className={`group relative flex flex-col min-h-[160px] aged-card rounded-2xl p-5 transition-all transform cursor-grab active:cursor-grabbing
                ${draggedItemIndex === index ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}
                ${isDark ? 'bg-[#1a1512] border-gold-faded/10 shadow-lg' : 'parchment-texture border-primary-light/10 shadow-md'}`}>
                
                <div className="flex justify-between items-start mb-2">
                  <div className={`px-2 py-0.5 rounded-full text-[7px] font-antique-display uppercase tracking-widest font-bold border
                    ${isDark ? 'bg-gold-faded/10 text-gold-faded border-gold-faded/20' : 'bg-primary-light/10 text-primary-light border-primary-light/20'}`}>
                    {item.category}
                  </div>
                  <span className={`material-symbols-outlined !text-[14px] opacity-20 ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>drag_indicator</span>
                </div>

                <h3 className={`font-antique-display text-base mb-2 font-bold transition-colors ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>
                  {item.title}
                </h3>
                
                <div className="flex-1 overflow-hidden opacity-80">
                  <div 
                    className={`text-[11px] leading-relaxed font-antique-serif italic line-clamp-3 ${isDark ? 'text-gold-faded/70' : 'text-primary-light'}`}
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.tags.map(tag => (
                      <span key={tag} className={`text-[7px] uppercase tracking-widest px-1.5 py-0.5 rounded border border-current/10 ${isDark ? 'bg-gold-faded/5' : 'bg-primary-light/5'}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      case 'cofre':
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center h-full">
             {!vaultUnlocked ? (
              <div className="max-w-[280px]">
                <span className="material-symbols-outlined text-7xl mb-4 opacity-20 text-accent-silk animate-pulse">lock_person</span>
                <h2 className={`text-xl font-antique-display mb-2 ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>Cofre de Segredos</h2>
                <button 
                  onClick={() => setVaultUnlocked(true)}
                  className={`w-full py-2.5 rounded-xl font-antique-display uppercase tracking-widest text-[9px] transition-all border shadow-lg
                  ${isDark ? 'bg-gold-faded/5 border-gold-faded/30 hover:bg-gold-faded/20 text-gold-faded' : 'bg-primary-light/5 border-primary-light/30 hover:bg-primary-light/20 text-primary-light'}`}>
                  Quebrar Selo Rúnico
                </button>
              </div>
            ) : (
              <div className="w-full h-full">
                <div className={`flex justify-between items-center mb-6 border-b border-current/10 pb-4 ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>
                  <h2 className="text-lg font-antique-display">Registros Restritos</h2>
                  <button onClick={() => setVaultUnlocked(false)} className="material-symbols-outlined opacity-40 hover:opacity-100 transition-opacity">lock_open</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {manuscripts.filter(m => m.isFavorite || m.isPinned).map(m => (
                    <div key={m.id} onClick={() => openManuscript(m)} className={`p-3 rounded-xl border cursor-pointer hover:bg-current/5 transition-all text-left ${isDark ? 'bg-black/20 border-gold-faded/10' : 'bg-white/20 border-primary-light/10'}`}>
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>{m.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'kanban':
        return renderKanban();
      case 'scriptor':
        return (
          <div className="flex flex-col gap-4 py-2 h-full">
            <div className={`p-6 md:p-8 rounded-2xl border flex flex-col flex-1 shadow-md
              ${isDark ? 'bg-black/40 border-gold-faded/20' : 'bg-white/40 border-primary-light/20'}`}>
              
              <div className="flex flex-col items-center justify-between mb-5 gap-4">
                <h2 className={`text-lg font-antique-display font-bold ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>Nova Inscrição</h2>
                <div className={`flex flex-wrap items-center justify-center gap-1 p-1.5 rounded-xl bg-black/5 no-print ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>
                   <button onClick={() => execCmd('bold')} title="Negrito" className="p-1.5 hover:bg-current/10 rounded-lg transition-all material-symbols-outlined !text-base">format_bold</button>
                   <button onClick={() => execCmd('italic')} title="Itálico" className="p-1.5 hover:bg-current/10 rounded-lg transition-all material-symbols-outlined !text-base">format_italic</button>
                   <button onClick={() => execCmd('underline')} title="Sublinhado" className="p-1.5 hover:bg-current/10 rounded-lg transition-all material-symbols-outlined !text-base">format_underlined</button>
                   <div className="w-px h-6 bg-current opacity-10 mx-1" />
                   <button onClick={() => execCmd('insertUnorderedList')} title="Lista" className="p-1.5 hover:bg-current/10 rounded-lg transition-all material-symbols-outlined !text-base">format_list_bulleted</button>
                   <button onClick={() => execCmd('formatBlock', 'blockquote')} title="Citação" className="p-1.5 hover:bg-current/10 rounded-lg transition-all material-symbols-outlined !text-base">format_quote</button>
                   <button onClick={insertTable} title="Inserir Tabela" className="p-1.5 hover:bg-current/10 rounded-lg transition-all material-symbols-outlined !text-base">grid_on</button>
                   <div className="w-px h-6 bg-current opacity-10 mx-1" />
                   <button onClick={handleInsertImage} title="Inserir Imagem" className="p-1.5 hover:bg-current/10 rounded-lg transition-all material-symbols-outlined !text-base">image</button>
                   <button onClick={() => execCmd('removeFormat')} title="Limpar Formatação" className="p-1.5 hover:bg-current/10 rounded-lg transition-all material-symbols-outlined !text-base">format_clear</button>
                </div>
              </div>
              
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Título do novo registro..." className={`w-full bg-transparent border-b-2 mb-4 px-0 py-2 font-antique-display text-lg md:text-xl focus:ring-0 transition-all border-current/10 focus:border-current/50 ${isDark ? 'text-gold-faded placeholder:text-gold-faded/20' : 'text-primary-light placeholder:text-primary-light/20'}`} />
              <div ref={editorRef} contentEditable className={`flex-1 w-full min-h-[220px] bg-transparent p-4 font-antique-serif italic text-base md:text-lg focus:outline-none overflow-y-auto custom-scrollbar border rounded-xl border-current/5 scribe-editor ${isDark ? 'text-gold-faded/90' : 'text-primary-light'}`} data-placeholder="As palavras fluem pelo pergaminho digital..." />
              
              <div className="mt-5">
                <p className={`text-[8px] uppercase tracking-[0.2em] font-bold mb-3 opacity-60 ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>Vincular Sabedoria</p>
                <div className="flex flex-wrap gap-2">
                  {KNOWLEDGE_TAGS.map(tag => (
                    <button key={tag} onClick={() => toggleTagSelection(tag)} className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border ${selectedTags.includes(tag) ? (isDark ? 'bg-gold-faded text-black border-gold-faded' : 'bg-primary-light text-white border-primary-light') : (isDark ? 'bg-transparent border-gold-faded/20 text-gold-faded/60 hover:border-gold-faded/50' : 'bg-transparent border-primary-light/20 text-primary-light/60 hover:border-primary-light/50')}`}>{tag}</button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                 <button onClick={handleScribe} disabled={isScribing} className={`flex-1 h-10 rounded-xl font-antique-display font-bold uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 shadow-sm ${isDark ? 'bg-accent-silk text-gold-faded active:scale-95 hover:brightness-110' : 'bg-primary-light text-white active:scale-95 hover:brightness-110'}`}>{isScribing ? <span className="material-symbols-outlined !text-xs animate-spin">sync</span> : <span className="material-symbols-outlined !text-xs">auto_fix</span>} Eternizar Fragmento</button>
              </div>
            </div>
          </div>
        );
      case 'ajustes':
        return (
          <div className="flex flex-col gap-6 py-6 h-full max-w-sm mx-auto">
             <div className="text-center mb-4">
               <h2 className={`text-xl font-antique-display font-bold mb-1 ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>Sintonização</h2>
               <p className="text-[8px] uppercase tracking-[0.4em] opacity-40">Essência do Códice</p>
             </div>
             <div className="space-y-4">
               <button onClick={toggleTheme} className={`w-full flex items-center justify-between p-5 rounded-xl border transition-all ${isDark ? 'bg-black/20 border-gold-faded/20' : 'bg-white/40 border-primary-light/20'}`}>
                  <div className={`flex items-center gap-3 ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>
                    <span className="material-symbols-outlined text-xl opacity-70">{isDark ? 'light_mode' : 'dark_mode'}</span>
                    <p className="font-bold text-[10px] uppercase tracking-widest">Tema Visual</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full p-1 transition-all flex items-center ${isDark ? 'bg-gold-faded/20' : 'bg-primary-light/20'}`}><div className={`size-3 rounded-full transition-all transform ${isDark ? 'translate-x-5 bg-gold-faded shadow-sm' : 'translate-x-0 bg-primary-light'}`}></div></div>
               </button>
               <div className={`p-5 rounded-xl border ${isDark ? 'bg-black/20 border-gold-faded/20' : 'bg-white/40 border-primary-light/20'}`}>
                  <div className={`flex items-center gap-3 mb-4 ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>
                    <span className="material-symbols-outlined text-xl opacity-70">format_size</span>
                    <p className="font-bold text-[10px] uppercase tracking-widest">Tamanho Texto</p>
                  </div>
                  <input type="range" min="14" max="36" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full accent-current h-1 bg-current/10 rounded-lg appearance-none cursor-pointer" />
               </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-center items-center p-0 md:p-6 transition-colors duration-700 ${isDark ? 'bg-[#0a0505]' : 'bg-[#e9e4d1]'}`}>
      <div className={`relative flex h-full min-h-screen md:min-h-[initial] md:h-[94vh] w-full max-w-6xl flex-col md:flex-row overflow-hidden shadow-2xl transition-all duration-700 md:rounded-[28px] ${isDark ? 'leather-texture leather-overlay border-black/80' : 'parchment-texture border-[#4a2c2e] md:border-x-[10px] shadow-inner'}`}>
        <div className="w-full md:w-1/2 flex flex-col relative z-20 border-b md:border-b-0 md:border-r border-black/10 overflow-hidden h-[26vh] md:h-full">
          <header className="pt-6 md:pt-10 pb-4 px-6 md:px-10 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h1 className={`text-2xl md:text-3xl font-antique-display font-bold tracking-[0.2em] uppercase transition-all ${isDark ? 'text-gold-faded drop-shadow-[0_0_10px_rgba(197,164,126,0.4)]' : 'text-primary-light italic'}`}>Códice</h1>
              <button onClick={() => setActiveTab('ajustes')} className={`size-10 md:size-12 rounded-full border p-1 overflow-hidden transition-all duration-500 hover:scale-105 border-current/10`}>
                <img alt="Mestre" className="w-full h-full rounded-full object-cover grayscale sepia" src="https://picsum.photos/seed/codex-master/150" />
              </button>
            </div>
            <div className="relative w-full group">
              <label className={`flex items-center rounded-xl px-4 h-10 md:h-12 border transition-all shadow-inner ${isDark ? 'bg-black/50 border-gold-faded/10 focus-within:border-gold-faded/40' : 'bg-white/50 border-primary-light/10 focus-within:border-primary-light/40'}`}>
                <span className={`material-symbols-outlined mr-2 text-xl opacity-30 ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>search</span>
                <input className={`bg-transparent border-none focus:ring-0 w-full p-0 text-sm md:text-base font-antique-serif placeholder:italic ${isDark ? 'text-gold-faded placeholder:text-gold-faded/20' : 'text-primary-light placeholder:text-primary-light/40'}`} placeholder="Inquirir arquivos..." type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </label>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto px-4 md:px-10 py-1 custom-scrollbar">
            <section className="mb-4">
                <div className={`p-1.5 rounded-2xl transition-all shadow-inner ${isDark ? 'bg-black/10' : 'bg-white/10'}`}>
                  <LearningPath theme={theme} onStepClick={(label) => { setActiveCategory(label); setActiveTab('arquivos'); }} />
                  <div className="hidden md:block">
                    <div className="h-px w-full bg-current opacity-5 my-4" />
                    <ManuscriptTree theme={theme} onItemClick={(label) => { setActiveCategory(label); setActiveTab('arquivos'); }} />
                  </div>
                </div>
            </section>
          </main>
        </div>
        <div className="w-full md:w-1/2 flex flex-col relative z-20 overflow-hidden h-[74vh] md:h-full">
          <main className="flex-1 overflow-y-auto px-5 md:px-10 py-6 md:py-10 custom-scrollbar pb-32 h-full">
             {renderTabContent()}
          </main>
        </div>
      </div>

      {selectedManuscript && (
        <div onClick={closeManuscript} className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-500 ease-in-out ${isOpening ? 'bg-black/95 backdrop-blur-xl' : 'bg-transparent pointer-events-none opacity-0'}`}>
          <div onClick={(e) => e.stopPropagation()} className={`relative w-full max-w-2xl flex flex-col rounded-2xl overflow-hidden transition-all duration-500 transform shadow-2xl ${isOpening ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} ${isDark ? 'bg-[#1e1b18] text-gold-faded border border-gold-faded/10' : 'bg-[#fcfaf2] text-primary-light border border-primary-light/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]'}`}>
            <div className={`flex items-center justify-between px-6 py-3 border-b border-current/5 no-print ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>
              <div className="flex gap-1.5">
                <button onClick={(e) => togglePin(selectedManuscript.id, e)} title="Fixar" className={`p-1.5 rounded-lg transition-all hover:bg-current/5 ${selectedManuscript.isPinned ? 'text-accent-silk scale-110' : 'opacity-40'}`}><span className="material-symbols-outlined !text-xl">{selectedManuscript.isPinned ? 'push_pin' : 'keep'}</span></button>
                <button onClick={(e) => toggleFavorite(selectedManuscript.id, e)} title="Favoritar" className={`p-1.5 rounded-lg transition-all hover:bg-current/5 ${selectedManuscript.isFavorite ? 'text-gold-vibrant scale-110' : 'opacity-40'}`}><span className="material-symbols-outlined !text-xl font-variation-settings-fill-1">star</span></button>
              </div>
              <div className="flex gap-1.5 relative">
                 <button onClick={() => setShowShareMenu(!showShareMenu)} title="Compartilhar" className={`p-1.5 rounded-lg transition-all ${showShareMenu ? 'bg-current/10 opacity-100' : 'opacity-40 hover:opacity-100 hover:bg-current/5'}`}><span className="material-symbols-outlined !text-xl">share</span></button>
                 
                 {showShareMenu && (
                   <div className={`absolute top-full right-0 mt-2 w-48 rounded-xl shadow-2xl border z-[300] animate-in slide-in-from-top-2 duration-200 overflow-hidden ${isDark ? 'bg-[#2a2622] border-gold-faded/20' : 'bg-white border-primary-light/10'}`}>
                     <button onClick={shareToEmail} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-current/10 transition-colors border-b border-current/5"><span className="material-symbols-outlined text-base">mail</span> E-mail</button>
                     <button onClick={shareToWhatsApp} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-current/10 transition-colors border-b border-current/5"><span className="material-symbols-outlined text-base">chat</span> WhatsApp</button>
                     <button onClick={handlePrint} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-current/10 transition-colors border-b border-current/5"><span className="material-symbols-outlined text-base">picture_as_pdf</span> PDF / Imprimir</button>
                     <button onClick={shareToKeep} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-current/10 transition-colors border-b border-current/5"><span className="material-symbols-outlined text-base">note_stack</span> Google Keep</button>
                     <button onClick={shareToNotion} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-current/10 transition-colors"><span className="material-symbols-outlined text-base">description</span> Notion</button>
                   </div>
                 )}

                 <button onClick={closeManuscript} title="Fechar" className="p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:bg-current/5 transition-all"><span className="material-symbols-outlined !text-xl">close</span></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-10 py-6">
              <h2 className={`text-xl md:text-2xl font-antique-display font-bold leading-tight mb-6 ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>{selectedManuscript.title}</h2>
              <div className={`font-antique-serif leading-relaxed text-base md:text-lg text-justify opacity-90 ink-bleed rich-content ${isDark ? 'text-gold-faded' : 'text-primary-light'}`} style={{ fontSize: `${fontSize}px` }} dangerouslySetInnerHTML={{ __html: selectedManuscript.content }} />
              {selectedManuscript.tags && selectedManuscript.tags.length > 0 && (
                <div className="mt-8 pt-4 border-t border-current/5 flex flex-wrap gap-2">
                  {selectedManuscript.tags.map(tag => (
                    <span key={tag} className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-current/20 ${isDark ? 'bg-gold-faded/5' : 'bg-primary-light/5'}`}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[70%] max-w-[300px] no-print">
        <div className={`relative flex items-center justify-between px-5 py-2 rounded-full border backdrop-blur-3xl shadow-xl transition-all duration-500 ${isDark ? 'bg-black/85 border-gold-faded/15 shadow-black/40' : 'bg-white/80 border-primary-light/15 shadow-stone-300'}`}>
          <button onClick={() => setActiveTab('arquivos')} className={`flex flex-col items-center gap-0.5 transition-all group ${activeTab === 'arquivos' ? (isDark ? 'text-gold-faded scale-110' : 'text-primary-light scale-110') : 'text-current/30 hover:text-current/60'}`}><span className="material-symbols-outlined text-lg">auto_stories</span><span className="text-[5px] font-bold uppercase tracking-widest">Anais</span></button>
          <button onClick={() => setActiveTab('cofre')} className={`flex flex-col items-center gap-0.5 transition-all group ${activeTab === 'cofre' ? (isDark ? 'text-gold-faded scale-110' : 'text-primary-light scale-110') : 'text-current/30 hover:text-current/60'}`}><span className="material-symbols-outlined text-lg">lock_person</span><span className="text-[5px] font-bold uppercase tracking-widest">Cofre</span></button>
          <div className="relative -top-2"><button onClick={() => setActiveTab('scriptor')} disabled={isScribing} className={`flex items-center justify-center size-9 rounded-full border shadow-lg transition-all transform hover:scale-110 active:scale-95 ${activeTab === 'scriptor' ? (isDark ? 'bg-accent-silk ring-1 ring-gold-faded/15' : 'bg-primary-light ring-1 ring-white/40') : (isDark ? 'bg-accent-silk border-black/40 text-gold-faded' : 'bg-primary-light border-white/40 text-white')}`}><span className={`material-symbols-outlined text-lg ${isScribing ? 'animate-spin' : ''}`}>{isScribing ? 'sync' : 'add'}</span></button></div>
          <button onClick={() => setActiveTab('kanban')} className={`flex flex-col items-center gap-0.5 transition-all group ${activeTab === 'kanban' ? (isDark ? 'text-gold-faded scale-110' : 'text-primary-light scale-110') : 'text-current/30 hover:text-current/60'}`}><span className="material-symbols-outlined text-lg">view_kanban</span><span className="text-[5px] font-bold uppercase tracking-widest">Kanban</span></button>
          <button onClick={() => setActiveTab('ajustes')} className={`flex items-center justify-center size-7 transition-all group ${activeTab === 'ajustes' ? (isDark ? 'text-gold-faded scale-125' : 'text-primary-light scale-125') : 'text-current/30 hover:text-current/60'}`}><span className={`material-symbols-outlined text-lg ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>settings</span></button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDark ? 'rgba(197, 164, 126, 0.25)' : 'rgba(103, 25, 33, 0.25)'}; border-radius: 10px; }
        .font-variation-settings-fill-1 { font-variation-settings: 'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
        [contenteditable]:empty:before { content: attr(data-placeholder); color: currentColor; opacity: 0.2; cursor: text; }
        .dark .text-current { color: #c5a47e !important; }
        .text-current { color: #671921 !important; }
        html:not(.dark) .material-symbols-outlined { color: #671921 !important; }
        html.dark .material-symbols-outlined { color: #c5a47e !important; }
        html:not(.dark) .text-gold-faded, html:not(.dark) .text-gold-vibrant { color: #671921 !important; }
        html:not(.dark) .border-gold-faded, html:not(.dark) .border-current { border-color: rgba(103, 25, 33, 0.3) !important; }
        
        .scribe-editor table, .rich-content table { border-collapse: collapse; margin: 10px 0; width: 100%; border: 1px solid currentColor; }
        .scribe-editor td, .rich-content td { border: 1px solid currentColor; padding: 8px; font-size: 0.9em; }
        .scribe-editor blockquote, .rich-content blockquote { border-left: 3px solid currentColor; padding-left: 15px; margin: 15px 0; font-style: italic; opacity: 0.8; }
        .scribe-editor img, .rich-content img { max-width: 100%; border-radius: 8px; margin: 10px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .scribe-editor u, .rich-content u { text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default App;
