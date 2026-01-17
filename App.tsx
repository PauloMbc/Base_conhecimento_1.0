
import React, { useState, useEffect, useRef } from 'react';
import { ThemeMode, Manuscript } from './types';
import LearningPath from './components/LearningPath';
import ManuscriptTree from './components/ManuscriptTree';
import { generateArcaneInsights } from './services/geminiService';

const INITIAL_MANUSCRIPTS: Manuscript[] = [
  { 
    id: '1', 
    category: 'Alquimia', 
    title: 'A Essência do Mercúrio Digital', 
    content: '<img src="https://images.unsplash.com/photo-1532187863486-abf51ad54417?auto=format&fit=crop&w=800&q=80" style="width:100%; border-radius:12px; margin-bottom:15px;" /><br/><b>Protocolo de Purificação:</b><br/>Para extrair a verdade dos dados brutos, deve-se filtrar as impurezas do ruído estático.', 
    timestamp: '3m atrás', 
    status: 'Selo de Prata', 
    isPinned: true, 
    tags: ['Conceito inicial'] 
  },
  { 
    id: '2', 
    category: 'Filosofia', 
    title: 'O Vazio Entre os Códigos', 
    content: 'Muitos buscam o poder na complexidade, mas a verdadeira maestria reside no espaço entre as linhas. O código que não é escrito é o mais resiliente de todos.', 
    timestamp: 'Out 2024', 
    status: 'Ancestral', 
    isFavorite: true, 
    tags: ['Conceito inicial', 'Gestão de Tarefas'] 
  },
];

const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('codex-theme');
    return (saved as ThemeMode) || ThemeMode.DARK;
  });

  const [manuscripts, setManuscripts] = useState<Manuscript[]>(() => {
    const saved = localStorage.getItem('codex-manuscripts');
    return saved ? JSON.parse(saved) : INITIAL_MANUSCRIPTS;
  });

  const [activeTab, setActiveTab] = useState('arquivos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isScribing, setIsScribing] = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const [newTitle, setNewTitle] = useState('');

  const isDark = theme === ThemeMode.DARK;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('codex-theme', theme);
  }, [isDark, theme]);

  useEffect(() => {
    localStorage.setItem('codex-manuscripts', JSON.stringify(manuscripts));
  }, [manuscripts]);

  const toggleTheme = () => setTheme(prev => prev === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK);

  const execCmd = (cmd: string, value: string | undefined = undefined) => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const handleInsertImage = () => {
    const url = window.prompt("Insira o link direto da imagem (URL):", "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80");
    if (url) {
      const imgHtml = `<img src="${url}" style="max-width: 100%; border-radius: 12px; margin: 15px 0; display: block; border: 1px solid rgba(128,128,128,0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.1);" /><br/>`;
      execCmd('insertHTML', imgHtml);
    }
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if(confirm("Deseja apagar este registro permanentemente dos anais?")) {
      setManuscripts(prev => prev.filter(m => m.id !== id));
      if (selectedManuscript?.id === id) {
        setIsOpening(false);
        setTimeout(() => setSelectedManuscript(null), 300);
      }
    }
  };

  const handleScribe = async () => {
    const manualContent = editorRef.current?.innerHTML || "";
    const plainText = manualContent.replace(/<[^>]*>/g, '').trim();

    setIsScribing(true);
    if (plainText.length > 5 || manualContent.includes('<img')) {
      const manuscript: Manuscript = {
        id: Date.now().toString(),
        category: 'Original',
        title: newTitle || "Fragmento Arcano",
        content: manualContent,
        timestamp: new Date().toLocaleDateString('pt-BR'),
        status: 'Autoral',
        tags: activeCategory ? [activeCategory] : []
      };
      setManuscripts(prev => [manuscript, ...prev]);
      if (editorRef.current) editorRef.current.innerHTML = '';
      setNewTitle('');
      setActiveTab('arquivos');
    } else {
      try {
        const newEntry = await generateArcaneInsights(newTitle || "Sabedoria Digital");
        if (newEntry) {
          const manuscript: Manuscript = {
            id: Date.now().toString(),
            category: newEntry.category,
            title: newEntry.title,
            content: newEntry.content,
            timestamp: new Date().toLocaleDateString('pt-BR'),
            status: newEntry.metadata,
            tags: activeCategory ? [activeCategory] : []
          };
          setManuscripts(prev => [manuscript, ...prev]);
          setNewTitle('');
          setActiveTab('arquivos');
        } else {
          alert("O Escriba automático requer uma API Key. Por favor, escreva seu próprio texto!");
        }
      } catch (e) {
        alert("Erro na conexão arcana. Use o modo manual.");
      }
    }
    setIsScribing(false);
  };

  const handlePrint = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedManuscript) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedManuscript.title}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=IM+Fell+English:ital@0;1&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'IM Fell English', serif; padding: 50px; background: #fdfaf0; color: #2d0a0a; line-height: 1.6; }
            .title { font-family: 'Cinzel', serif; font-size: 32px; text-align: center; border-bottom: 2px solid #671921; margin-bottom: 40px; padding-bottom: 20px; text-transform: uppercase; }
            .content img { max-width: 100%; border-radius: 12px; border: 1px solid #671921; margin: 25px 0; }
            .footer { margin-top: 50px; border-top: 1px dashed #671921; pt: 20px; font-size: 12px; opacity: 0.6; text-align: center; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="title">${selectedManuscript.title}</div>
          <div>${selectedManuscript.content}</div>
          <div class="footer">Gerado pelo Códice Arcano em ${selectedManuscript.timestamp}</div>
          <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 600); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const shareManuscript = async (platform: string) => {
    if (!selectedManuscript) return;
    const cleanContent = selectedManuscript.content.replace(/<[^>]*>/g, '\n');
    const textToShare = `📜 *${selectedManuscript.title}*\n\n${cleanContent}\n\n— Registro do Códice Arcano`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(selectedManuscript.title)}&body=${encodeURIComponent(textToShare)}`;
        break;
      case 'pdf':
        handlePrint();
        break;
      case 'notion':
      case 'keep':
        try {
          await navigator.clipboard.writeText(textToShare);
          alert(`Conteúdo copiado! Abrindo ${platform === 'notion' ? 'o Notion' : 'o Keep'}... Basta colar (Ctrl+V).`);
          window.open(platform === 'notion' ? 'https://www.notion.so' : 'https://keep.google.com', '_blank');
        } catch (err) {
          alert('Falha ao copiar conteúdo.');
        }
        break;
    }
    setShowShareMenu(false);
  };

  const filteredManuscripts = manuscripts.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? (m.category === activeCategory || m.tags?.includes(activeCategory)) : true;
    return matchesSearch && matchesCategory;
  });

  const renderKanban = () => {
    const categories = ['Conceito inicial', 'Gestão de Tarefas', 'Word', 'Excel', 'Original'];
    return (
      <div className="flex gap-5 overflow-x-auto pb-8 h-full custom-scrollbar items-start">
        {categories.map(cat => (
          <div key={cat} className={`flex-shrink-0 w-72 rounded-2xl border flex flex-col max-h-full shadow-lg ${isDark ? 'bg-black/30 border-gold-faded/10' : 'bg-white/40 border-primary-light/10'}`}>
            <div className={`p-4 border-b border-current/10 flex justify-between items-center ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>
              <h3 className="font-antique-display text-[10px] font-bold uppercase tracking-[0.2em]">{cat}</h3>
              <span className="text-[10px] font-bold opacity-30 px-2 py-0.5 rounded-full border border-current/10">{manuscripts.filter(m => m.category === cat || m.tags?.includes(cat)).length}</span>
            </div>
            <div className="p-3 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-3">
              {manuscripts.filter(m => m.category === cat || m.tags?.includes(cat)).map(m => (
                <div key={m.id} onClick={() => { setSelectedManuscript(m); setIsOpening(true); }} className={`p-4 rounded-xl border cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 ${isDark ? 'bg-[#1a1512] border-gold-faded/10 text-gold-faded/80' : 'bg-[#ede5d6] border-primary-light/10 text-primary-light/80'}`}>
                  <h4 className="text-xs font-bold mb-2">{m.title}</h4>
                  <div className="text-[10px] italic line-clamp-2 opacity-60" dangerouslySetInnerHTML={{ __html: m.content }} />
                </div>
              ))}
              {manuscripts.filter(m => m.category === cat || m.tags?.includes(cat)).length === 0 && (
                <div className="py-10 text-center opacity-20 text-[10px] uppercase font-bold tracking-widest italic">Vazio</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-center items-center p-0 md:p-6 transition-colors duration-700 ${isDark ? 'bg-[#0a0505]' : 'bg-[#f6f3e9]'}`}>
      <div className={`relative flex h-full min-h-screen md:min-h-[initial] md:h-[94vh] w-full max-w-6xl flex-col md:flex-row overflow-hidden shadow-2xl transition-all duration-700 md:rounded-[36px] border ${isDark ? 'leather-texture leather-overlay border-black/80' : 'parchment-texture border-[#4a2c2e]/20'}`}>
        
        {/* SIDEBAR */}
        <div className="w-full md:w-1/3 flex flex-col border-b md:border-b-0 md:border-r border-black/10 overflow-hidden h-[30vh] md:h-full z-10">
          <header className="pt-8 px-8 pb-4 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-antique-display font-bold tracking-[0.2em] uppercase transition-all ${isDark ? 'text-gold-faded' : 'text-primary-light italic'}`}>Códice</h1>
              <button onClick={toggleTheme} className={`size-10 rounded-full border flex items-center justify-center transition-all hover:rotate-180 border-current/10 ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>
                <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
              </button>
            </div>
            <label className={`flex items-center rounded-2xl px-5 h-12 border shadow-inner transition-all focus-within:border-current/40 ${isDark ? 'bg-black/50 border-gold-faded/10' : 'bg-white/50 border-primary-light/10'}`}>
              <span className="material-symbols-outlined opacity-30 mr-3">search</span>
              <input className={`bg-transparent border-none focus:ring-0 w-full p-0 font-antique-serif italic ${isDark ? 'text-gold-faded' : 'text-primary-light'}`} placeholder="Inquirir arquivos..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </label>
          </header>
          <div className="flex-1 overflow-y-auto px-6 custom-scrollbar pb-10">
            <LearningPath theme={theme} onStepClick={l => { setActiveCategory(l); setActiveTab('arquivos'); }} />
            <div className="h-px w-full bg-current opacity-5 my-6" />
            <ManuscriptTree theme={theme} onItemClick={l => { setActiveCategory(l); setActiveTab('arquivos'); }} />
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="w-full md:w-2/3 flex flex-col overflow-hidden h-[70vh] md:h-full relative">
          <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 custom-scrollbar pb-32">
            {activeTab === 'arquivos' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-500">
                {filteredManuscripts.length === 0 ? (
                  <p className="col-span-full text-center py-20 opacity-30 font-antique-serif text-xl italic">Silêncio nos registros...</p>
                ) : filteredManuscripts.map(m => (
                  <div key={m.id} onClick={() => { setSelectedManuscript(m); setIsOpening(true); }} className={`aged-card group rounded-2xl p-6 transition-all transform cursor-pointer border hover:-translate-y-1 shadow-sm relative ${isDark ? 'bg-black/40 border-gold-faded/10 text-gold-faded' : 'bg-white/60 border-primary-light/10 text-primary-light'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[8px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border border-current/20">{m.category}</span>
                      <button onClick={(e) => handleDelete(m.id, e)} className="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity p-1"><span className="material-symbols-outlined !text-sm">delete</span></button>
                    </div>
                    <h3 className="font-antique-display text-lg mb-2 font-bold leading-tight">{m.title}</h3>
                    <div className="text-xs line-clamp-3 italic opacity-70 leading-relaxed font-antique-serif" dangerouslySetInnerHTML={{ __html: m.content }} />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'scriptor' && (
              <div className={`p-8 rounded-[32px] border flex flex-col h-full shadow-2xl animate-in fade-in zoom-in-95 ${isDark ? 'bg-black/60 border-gold-faded/20' : 'bg-white/60 border-primary-light/20'}`}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className={`text-xl font-antique-display font-bold ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>Nova Inscrição</h2>
                  <div className="flex gap-2 p-1.5 rounded-2xl bg-black/5">
                    <button onClick={() => execCmd('bold')} className="p-2 hover:bg-current/10 rounded-xl material-symbols-outlined !text-lg transition-colors">format_bold</button>
                    <button onClick={handleInsertImage} className="p-2 hover:bg-current/10 rounded-xl material-symbols-outlined !text-lg transition-colors">image</button>
                    <button onClick={() => {
                       const rows = window.prompt("Linhas:");
                       const cols = window.prompt("Colunas:");
                       if(rows && cols) {
                         let table = '<table style="width:100%; border-collapse:collapse; border:1px solid currentColor; margin:10px 0;">';
                         for(let i=0; i<parseInt(rows); i++){
                           table += '<tr>';
                           for(let j=0; j<parseInt(cols); j++) table += '<td style="border:1px solid currentColor; padding:8px;">...</td>';
                           table += '</tr>';
                         }
                         table += '</table><br/>';
                         execCmd('insertHTML', table);
                       }
                    }} className="p-2 hover:bg-current/10 rounded-xl material-symbols-outlined !text-lg transition-colors">grid_on</button>
                  </div>
                </div>
                <input type="text" placeholder="Título do Fragmento..." value={newTitle} onChange={e => setNewTitle(e.target.value)} className={`bg-transparent border-b-2 mb-6 px-0 py-2 font-antique-display text-2xl focus:ring-0 transition-all border-current/10 focus:border-current/50 ${isDark ? 'text-gold-faded placeholder:text-gold-faded/20' : 'text-primary-light placeholder:text-primary-light/20'}`} />
                <div ref={editorRef} contentEditable className={`flex-1 font-antique-serif italic text-lg focus:outline-none overflow-y-auto custom-scrollbar p-2 outline-none ${isDark ? 'text-gold-faded/90' : 'text-primary-light'}`} data-placeholder="As palavras fluem pelo pergaminho digital..." />
                <button onClick={handleScribe} disabled={isScribing} className={`mt-8 h-14 rounded-2xl font-antique-display font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 ${isDark ? 'bg-gold-faded text-black hover:bg-white' : 'bg-primary-light text-white hover:opacity-90'}`}>
                  {isScribing ? <span className="animate-spin material-symbols-outlined">sync</span> : <span className="material-symbols-outlined">auto_fix</span>}
                  Eternizar Registro
                </button>
              </div>
            )}

            {activeTab === 'kanban' && renderKanban()}
            
            {activeTab === 'cofre' && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                {!vaultUnlocked ? (
                  <div className="max-w-xs animate-in zoom-in-95">
                    <span className="material-symbols-outlined text-8xl mb-6 opacity-20 animate-pulse text-accent-silk">lock_person</span>
                    <h2 className={`text-2xl font-antique-display mb-6 ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>Cofre de Segredos</h2>
                    <button onClick={() => setVaultUnlocked(true)} className={`w-full py-4 rounded-2xl font-antique-display uppercase tracking-widest text-[10px] transition-all border shadow-lg hover:bg-current/5 active:scale-95 ${isDark ? 'bg-gold-faded/5 border-gold-faded/30 text-gold-faded' : 'bg-primary-light/5 border-primary-light/30 text-primary-light'}`}>Quebrar Selo Rúnico</button>
                  </div>
                ) : (
                  <div className="w-full h-full animate-in fade-in">
                    <div className="flex justify-between items-center mb-8 border-b border-current/10 pb-4">
                      <h2 className={`text-xl font-antique-display ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>Registros Restritos</h2>
                      <button onClick={() => setVaultUnlocked(false)} className="material-symbols-outlined opacity-40 hover:opacity-100 transition-opacity">lock_open</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {manuscripts.filter(m => m.isFavorite || m.isPinned).length === 0 ? (
                        <p className="col-span-full py-20 opacity-20 italic">O cofre está vazio...</p>
                      ) : manuscripts.filter(m => m.isFavorite || m.isPinned).map(m => (
                        <div key={m.id} onClick={() => { setSelectedManuscript(m); setIsOpening(true); }} className={`p-6 rounded-xl border text-left cursor-pointer transition-all hover:bg-current/5 ${isDark ? 'bg-black/20 border-gold-faded/10 text-gold-faded' : 'bg-white/20 border-primary-light/10 text-primary-light'}`}>
                          <p className="font-bold text-sm mb-1">{m.title}</p>
                          <p className="text-[10px] opacity-40 italic tracking-widest">{m.timestamp}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ajustes' && (
              <div className="max-w-md mx-auto py-10 text-center flex flex-col gap-10">
                <h2 className={`text-2xl font-antique-display font-bold ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>Sintonização</h2>
                <div className={`p-8 rounded-3xl border flex flex-col gap-8 shadow-inner ${isDark ? 'bg-black/40 border-gold-faded/20' : 'bg-white/40 border-primary-light/20'}`}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 mb-6">Tamanho da Fonte Arcana</p>
                    <input type="range" min="14" max="32" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full accent-current h-1.5 bg-current/10 rounded-full appearance-none cursor-pointer" />
                    <p className="mt-4 text-xs opacity-40 italic">Exemplo de leitura em {fontSize}px</p>
                  </div>
                </div>
                <button onClick={() => { if(confirm("Apagar todos os registros permanentemente?")) setManuscripts(INITIAL_MANUSCRIPTS); }} className="text-[9px] uppercase tracking-[0.3em] opacity-20 hover:opacity-100 hover:text-red-500 transition-all">Limpar Toda a Biblioteca</button>
              </div>
            )}
          </main>
        </div>

        {/* FLOAT MENU */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[440px] no-print">
          <nav className={`flex items-center justify-between px-6 py-4 rounded-full border backdrop-blur-3xl shadow-2xl transition-all ${isDark ? 'bg-black/90 border-gold-faded/20' : 'bg-white/90 border-primary-light/20'}`}>
            <button onClick={() => { setActiveTab('arquivos'); setActiveCategory(null); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'arquivos' ? 'scale-110 opacity-100' : 'opacity-30'}`}><span className="material-symbols-outlined text-2xl">auto_stories</span><span className="text-[6px] font-bold uppercase tracking-widest">Anais</span></button>
            <button onClick={() => setActiveTab('cofre')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'cofre' ? 'scale-110 opacity-100' : 'opacity-30'}`}><span className="material-symbols-outlined text-2xl">lock_person</span><span className="text-[6px] font-bold uppercase tracking-widest">Cofre</span></button>
            <div className="relative -top-5"><button onClick={() => setActiveTab('scriptor')} className={`size-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-90 shadow-2xl border-[6px] ${isDark ? 'bg-gold-faded text-black border-black/80' : 'bg-primary-light text-white border-white/80'}`}><span className="material-symbols-outlined text-3xl">add</span></button></div>
            <button onClick={() => setActiveTab('kanban')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'kanban' ? 'scale-110 opacity-100' : 'opacity-30'}`}><span className="material-symbols-outlined text-2xl">view_kanban</span><span className="text-[6px] font-bold uppercase tracking-widest">Kanban</span></button>
            <button onClick={() => setActiveTab('ajustes')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'ajustes' ? 'scale-110 opacity-100' : 'opacity-30'}`}><span className="material-symbols-outlined text-2xl">settings</span><span className="text-[6px] font-bold uppercase tracking-widest">Ajustes</span></button>
          </nav>
        </div>
      </div>

      {/* OVERLAY VIEWER */}
      {selectedManuscript && (
        <div onClick={() => { setIsOpening(false); setShowShareMenu(false); setTimeout(() => setSelectedManuscript(null), 300); }} className={`fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 transition-all duration-300 ${isOpening ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div onClick={e => e.stopPropagation()} className={`relative w-full max-w-3xl rounded-[40px] overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_80px_rgba(0,0,0,0.5)] border transition-all duration-500 transform ${isOpening ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'} ${isDark ? 'bg-[#1a1715] text-gold-faded border-gold-faded/20' : 'bg-[#fcfaf2] text-primary-light border-primary-light/20'}`}>
            <div className="px-8 py-5 border-b border-current/10 flex justify-between items-center bg-current/5">
              <div className="flex gap-6">
                <div className="relative">
                  <button onClick={() => setShowShareMenu(!showShareMenu)} className="opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2 group"><span className="material-symbols-outlined group-hover:scale-110 transition-transform">share</span> <span className="text-[10px] font-bold uppercase tracking-widest">Compartilhar</span></button>
                  
                  {/* Share Menu Functional UI */}
                  {showShareMenu && (
                    <div className={`absolute top-full left-0 mt-3 w-56 rounded-2xl border shadow-[0_10px_40px_rgba(0,0,0,0.3)] p-2 z-[120] animate-in fade-in slide-in-from-top-4 ${isDark ? 'bg-paper-dark border-gold-faded/20' : 'bg-white border-primary-light/20'}`}>
                      <button onClick={() => shareManuscript('whatsapp')} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-current/5 rounded-xl text-[10px] font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-all">
                        <span className="material-symbols-outlined !text-lg text-green-500">chat</span> WhatsApp
                      </button>
                      <button onClick={() => shareManuscript('email')} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-current/5 rounded-xl text-[10px] font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-all">
                        <span className="material-symbols-outlined !text-lg text-blue-500">mail</span> E-mail
                      </button>
                      <button onClick={() => shareManuscript('pdf')} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-current/5 rounded-xl text-[10px] font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-all">
                        <span className="material-symbols-outlined !text-lg text-red-500">picture_as_pdf</span> Gerar PDF
                      </button>
                      <div className="h-px bg-current/10 my-1 mx-2" />
                      <button onClick={() => shareManuscript('notion')} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-current/5 rounded-xl text-[10px] font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-all">
                        <span className="material-symbols-outlined !text-lg">inventory</span> Notion
                      </button>
                      <button onClick={() => shareManuscript('keep')} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-current/5 rounded-xl text-[10px] font-bold uppercase tracking-widest opacity-80 hover:opacity-100 transition-all">
                        <span className="material-symbols-outlined !text-lg text-yellow-500">notes</span> Google Keep
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={handlePrint} className="opacity-40 hover:opacity-100 transition-opacity flex items-center gap-2 group"><span className="material-symbols-outlined group-hover:scale-110 transition-transform">print</span> <span className="text-[10px] font-bold uppercase tracking-widest">Imprimir</span></button>
              </div>
              <button onClick={() => { setIsOpening(false); setShowShareMenu(false); setTimeout(() => setSelectedManuscript(null), 300); }} className="opacity-40 hover:opacity-100 transition-opacity p-2 hover:bg-current/5 rounded-full"><span className="material-symbols-outlined !text-2xl">close</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              <h2 className="text-4xl font-antique-display mb-10 font-bold leading-tight">{selectedManuscript.title}</h2>
              <div className="font-antique-serif leading-relaxed text-justify opacity-90 rich-content" style={{ fontSize: `${fontSize}px` }} dangerouslySetInnerHTML={{ __html: selectedManuscript.content }} />
              <div className="mt-20 pt-8 border-t border-current/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 italic">
                <span>Criado em: {selectedManuscript.timestamp}</span>
                <span className="px-3 py-1 border border-current/20 rounded-full">{selectedManuscript.status}</span>
                <span>Registro ID: {selectedManuscript.id}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: currentColor; opacity: 0.15; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        [contenteditable]:empty:before { content: attr(data-placeholder); opacity: 0.2; }
        .rich-content img { max-width: 100%; border-radius: 16px; margin: 30px 0; box-shadow: 0 20px 50px rgba(0,0,0,0.4); border: 1px solid rgba(128,128,128,0.1); }
        .rich-content table { width: 100%; border-collapse: collapse; margin: 25px 0; border: 1px solid currentColor; }
        .rich-content td { border: 1px solid currentColor; padding: 12px; font-size: 0.95em; }
        .rich-content b, .rich-content strong { font-weight: 700; }
        @media print { .no-print { display: none !important; } }
      `}</style>
    </div>
  );
};

export default App;
