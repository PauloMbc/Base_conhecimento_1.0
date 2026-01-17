
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
    timestamp: '01/01/2024', 
    status: 'Selo de Prata', 
    isPinned: true, 
    tags: ['Conceito inicial'] 
  },
  { 
    id: '2', 
    category: 'Filosofia', 
    title: 'O Vazio Entre os Códigos', 
    content: 'Muitos buscam o poder na complexidade, mas a verdadeira maestria reside no espaço entre as linhas. O código que não é escrito é o mais resiliente de todos.', 
    timestamp: '15/10/2023', 
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
    if(confirm("Deseja apagar este registro permanentemente?")) {
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
        category: activeCategory || 'Original',
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
            body { font-family: 'IM Fell English', serif; padding: 40px; background: #fdfaf0; color: #2d0a0a; line-height: 1.6; }
            .title { font-family: 'Cinzel', serif; font-size: 30px; text-align: center; border-bottom: 2px solid #671921; margin-bottom: 40px; padding-bottom: 20px; text-transform: uppercase; letter-spacing: 2px; }
            .content img { max-width: 100%; border-radius: 8px; border: 1px solid #671921; margin: 20px 0; display: block; margin-left: auto; margin-right: auto; }
            .footer { margin-top: 60px; border-top: 1px dashed #671921; padding-top: 20px; font-size: 11px; opacity: 0.5; text-align: center; font-style: italic; }
            @media print { body { padding: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="title">${selectedManuscript.title}</div>
          <div class="content">${selectedManuscript.content}</div>
          <div class="footer">Este documento foi extraído do Códice Arcano em ${selectedManuscript.timestamp}</div>
          <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 700); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const shareManuscript = async (platform: string) => {
    if (!selectedManuscript) return;
    
    // Limpar HTML para texto puro no compartilhamento
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = selectedManuscript.content;
    const cleanContent = tempDiv.innerText || tempDiv.textContent || "";
    
    const shareTitle = `📜 *${selectedManuscript.title.toUpperCase()}*`;
    const shareBody = `${shareTitle}\n\n${cleanContent}\n\n— _Enviado via Códice Arcano_`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareBody)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(selectedManuscript.title)}&body=${encodeURIComponent(shareBody)}`;
        break;
      case 'pdf':
        handlePrint();
        break;
      case 'notion':
      case 'keep':
        try {
          await navigator.clipboard.writeText(shareBody);
          alert(`✨ Conteúdo copiado! Abrindo o ${platform === 'notion' ? 'Notion' : 'Google Keep'}... Basta colar (Ctrl+V) sua nota lá.`);
          window.open(platform === 'notion' ? 'https://www.notion.so' : 'https://keep.google.com', '_blank');
        } catch (err) {
          alert('Erro ao acessar a área de transferência.');
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
      <div className="flex gap-6 overflow-x-auto pb-10 h-full custom-scrollbar items-start">
        {categories.map(cat => (
          <div key={cat} className={`flex-shrink-0 w-80 rounded-[24px] border flex flex-col max-h-full shadow-xl ${isDark ? 'bg-black/40 border-gold-faded/10' : 'bg-white/50 border-primary-light/10'}`}>
            <div className={`p-5 border-b border-current/10 flex justify-between items-center ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>
              <h3 className="font-antique-display text-[11px] font-bold uppercase tracking-[0.25em]">{cat}</h3>
              <span className="text-[10px] font-bold bg-current/10 px-2.5 py-1 rounded-full">{manuscripts.filter(m => m.category === cat || m.tags?.includes(cat)).length}</span>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-4">
              {manuscripts.filter(m => m.category === cat || m.tags?.includes(cat)).map(m => (
                <div key={m.id} onClick={() => { setSelectedManuscript(m); setIsOpening(true); }} className={`p-5 rounded-2xl border cursor-pointer hover:shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 ${isDark ? 'bg-[#1a1512] border-gold-faded/15 text-gold-faded/90' : 'bg-[#f5ebd8] border-primary-light/15 text-primary-light/90'}`}>
                  <h4 className="text-sm font-bold mb-2 leading-tight">{m.title}</h4>
                  <div className="text-[11px] italic line-clamp-2 opacity-60 font-antique-serif" dangerouslySetInnerHTML={{ __html: m.content }} />
                </div>
              ))}
              {manuscripts.filter(m => m.category === cat || m.tags?.includes(cat)).length === 0 && (
                <div className="py-12 text-center opacity-20 text-[10px] uppercase font-bold tracking-widest italic">Silêncio...</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-center items-center p-0 md:p-6 transition-colors duration-1000 ${isDark ? 'bg-[#0a0505]' : 'bg-[#f6f3e9]'}`}>
      <div className={`relative flex h-full min-h-screen md:min-h-[initial] md:h-[94vh] w-full max-w-6xl flex-col md:flex-row overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.4)] transition-all duration-1000 md:rounded-[40px] border ${isDark ? 'leather-texture leather-overlay border-black/80' : 'parchment-texture border-[#4a2c2e]/20'}`}>
        
        {/* SIDEBAR */}
        <div className="w-full md:w-1/3 flex flex-col border-b md:border-b-0 md:border-r border-black/10 overflow-hidden h-[35vh] md:h-full z-10">
          <header className="pt-10 px-10 pb-6 flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h1 className={`text-4xl font-antique-display font-bold tracking-[0.25em] uppercase transition-all ${isDark ? 'text-gold-faded' : 'text-primary-light italic'}`}>Códice</h1>
              <button onClick={toggleTheme} className={`size-12 rounded-full border flex items-center justify-center transition-all hover:rotate-180 border-current/10 hover:bg-current/5 ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>
                <span className="material-symbols-outlined !text-2xl">{isDark ? 'light_mode' : 'dark_mode'}</span>
              </button>
            </div>
            <label className={`flex items-center rounded-2xl px-6 h-14 border shadow-inner transition-all focus-within:ring-2 focus-within:ring-current/20 ${isDark ? 'bg-black/50 border-gold-faded/10' : 'bg-white/50 border-primary-light/10'}`}>
              <span className="material-symbols-outlined opacity-30 mr-4">search</span>
              <input className={`bg-transparent border-none focus:ring-0 w-full p-0 font-antique-serif italic text-lg ${isDark ? 'text-gold-faded' : 'text-primary-light'}`} placeholder="Pesquisar anais..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </label>
          </header>
          <div className="flex-1 overflow-y-auto px-8 custom-scrollbar pb-12">
            <LearningPath theme={theme} onStepClick={l => { setActiveCategory(l); setActiveTab('arquivos'); }} />
            <div className="h-px w-full bg-current opacity-5 my-8" />
            <ManuscriptTree theme={theme} onItemClick={l => { setActiveCategory(l); setActiveTab('arquivos'); }} />
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="w-full md:w-2/3 flex flex-col overflow-hidden h-[65vh] md:h-full relative">
          <main className="flex-1 overflow-y-auto px-8 md:px-16 py-12 custom-scrollbar pb-40">
            {activeTab === 'arquivos' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-in fade-in duration-700">
                {filteredManuscripts.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-32 opacity-20">
                    <span className="material-symbols-outlined text-7xl mb-4">history_edu</span>
                    <p className="font-antique-serif text-2xl italic">Nenhum registro encontrado...</p>
                  </div>
                ) : filteredManuscripts.map(m => (
                  <div key={m.id} onClick={() => { setSelectedManuscript(m); setIsOpening(true); }} className={`aged-card group rounded-[28px] p-8 transition-all transform cursor-pointer border hover:-translate-y-2 shadow-md relative overflow-hidden ${isDark ? 'bg-black/40 border-gold-faded/10 text-gold-faded' : 'bg-white/70 border-primary-light/10 text-primary-light'}`}>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <span className="text-[9px] uppercase font-bold tracking-[0.2em] px-3 py-1 rounded-full border border-current/20 bg-current/5">{m.category}</span>
                      <button onClick={(e) => handleDelete(m.id, e)} className="opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded-full"><span className="material-symbols-outlined !text-lg">delete_sweep</span></button>
                    </div>
                    <h3 className="font-antique-display text-xl mb-3 font-bold leading-tight relative z-10">{m.title}</h3>
                    <div className="text-sm line-clamp-3 italic opacity-70 leading-relaxed font-antique-serif relative z-10" dangerouslySetInnerHTML={{ __html: m.content }} />
                    <div className="absolute -bottom-4 -right-4 opacity-[0.03] rotate-12 transition-transform group-hover:rotate-0"><span className="material-symbols-outlined !text-9xl">menu_book</span></div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'scriptor' && (
              <div className={`p-10 rounded-[40px] border flex flex-col h-full shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500 ${isDark ? 'bg-black/60 border-gold-faded/20' : 'bg-white/80 border-primary-light/20'}`}>
                <div className="flex items-center justify-between mb-10">
                  <h2 className={`text-2xl font-antique-display font-bold ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>Nova Inscrição</h2>
                  <div className="flex gap-3 p-2 rounded-[20px] bg-black/5">
                    <button onClick={() => execCmd('bold')} className="size-10 flex items-center justify-center hover:bg-current/10 rounded-xl material-symbols-outlined !text-xl transition-colors">format_bold</button>
                    <button onClick={handleInsertImage} className="size-10 flex items-center justify-center hover:bg-current/10 rounded-xl material-symbols-outlined !text-xl transition-colors">image</button>
                    <button onClick={() => {
                       const rows = window.prompt("Linhas:");
                       const cols = window.prompt("Colunas:");
                       if(rows && cols) {
                         let table = '<table style="width:100%; border-collapse:collapse; border:1px solid currentColor; margin:15px 0;">';
                         for(let i=0; i<parseInt(rows); i++){
                           table += '<tr>';
                           for(let j=0; j<parseInt(cols); j++) table += '<td style="border:1px solid currentColor; padding:10px; text-align:center;">...</td>';
                           table += '</tr>';
                         }
                         table += '</table><br/>';
                         execCmd('insertHTML', table);
                       }
                    }} className="size-10 flex items-center justify-center hover:bg-current/10 rounded-xl material-symbols-outlined !text-xl transition-colors">grid_on</button>
                  </div>
                </div>
                <input type="text" placeholder="Título do Manuscrito..." value={newTitle} onChange={e => setNewTitle(e.target.value)} className={`bg-transparent border-b-2 mb-8 px-0 py-3 font-antique-display text-3xl focus:ring-0 transition-all border-current/10 focus:border-current/50 outline-none ${isDark ? 'text-gold-faded placeholder:text-gold-faded/15' : 'text-primary-light placeholder:text-primary-light/15'}`} />
                <div ref={editorRef} contentEditable className={`flex-1 font-antique-serif italic text-xl focus:outline-none overflow-y-auto custom-scrollbar p-3 outline-none leading-relaxed ${isDark ? 'text-gold-faded/90' : 'text-primary-light'}`} data-placeholder="As palavras ganham vida no pergaminho digital..." />
                <button onClick={handleScribe} disabled={isScribing} className={`mt-10 h-16 rounded-[24px] font-antique-display font-bold uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 hover:brightness-110 ${isDark ? 'bg-gold-faded text-black' : 'bg-primary-light text-white'}`}>
                  {isScribing ? <span className="animate-spin material-symbols-outlined">sync</span> : <span className="material-symbols-outlined">auto_fix</span>}
                  Eternizar
                </button>
              </div>
            )}

            {activeTab === 'kanban' && renderKanban()}
            
            {activeTab === 'cofre' && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                {!vaultUnlocked ? (
                  <div className="max-w-md animate-in zoom-in-95 duration-700">
                    <span className="material-symbols-outlined text-9xl mb-8 opacity-10 animate-pulse text-accent-silk">lock_person</span>
                    <h2 className={`text-3xl font-antique-display mb-8 font-bold tracking-widest ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>Cofre de Segredos</h2>
                    <p className="opacity-40 mb-10 italic font-antique-serif">Apenas os dignos podem acessar os registros restritos.</p>
                    <button onClick={() => setVaultUnlocked(true)} className={`w-full py-5 rounded-[24px] font-antique-display uppercase tracking-[0.3em] text-[11px] transition-all border-2 shadow-2xl hover:bg-current/5 active:scale-95 ${isDark ? 'bg-gold-faded/5 border-gold-faded/30 text-gold-faded' : 'bg-primary-light/5 border-primary-light/30 text-primary-light'}`}>Revelar Segredos</button>
                  </div>
                ) : (
                  <div className="w-full h-full animate-in fade-in duration-700">
                    <div className="flex justify-between items-center mb-10 border-b-2 border-current/10 pb-6">
                      <h2 className={`text-2xl font-antique-display font-bold ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>Biblioteca Proibida</h2>
                      <button onClick={() => setVaultUnlocked(false)} className="material-symbols-outlined opacity-30 hover:opacity-100 transition-opacity p-2 hover:bg-current/5 rounded-full">lock_open</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {manuscripts.filter(m => m.isFavorite || m.isPinned).length === 0 ? (
                        <p className="col-span-full py-32 opacity-20 italic text-xl font-antique-serif">O silêncio ecoa pelo cofre...</p>
                      ) : manuscripts.filter(m => m.isFavorite || m.isPinned).map(m => (
                        <div key={m.id} onClick={() => { setSelectedManuscript(m); setIsOpening(true); }} className={`p-8 rounded-[28px] border-2 text-left cursor-pointer transition-all hover:bg-current/5 hover:scale-[1.02] active:scale-95 ${isDark ? 'bg-black/30 border-gold-faded/10 text-gold-faded' : 'bg-white/30 border-primary-light/10 text-primary-light'}`}>
                          <p className="font-bold text-lg mb-2 font-antique-display">{m.title}</p>
                          <p className="text-[11px] opacity-40 italic tracking-widest uppercase">{m.timestamp}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ajustes' && (
              <div className="max-w-lg mx-auto py-12 text-center flex flex-col gap-12">
                <h2 className={`text-3xl font-antique-display font-bold ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>Sintonização do Éter</h2>
                <div className={`p-10 rounded-[40px] border-2 flex flex-col gap-10 shadow-2xl ${isDark ? 'bg-black/40 border-gold-faded/20' : 'bg-white/40 border-primary-light/20'}`}>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-50 mb-8 flex items-center justify-center gap-3"><span className="material-symbols-outlined !text-sm">format_size</span> Tamanho da Fonte</p>
                    <input type="range" min="14" max="36" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full accent-current h-2 bg-current/10 rounded-full appearance-none cursor-pointer" />
                    <div className="mt-8 p-6 rounded-2xl border border-current/10 bg-current/5">
                        <p className="font-antique-serif italic" style={{ fontSize: `${fontSize}px` }}>A sabedoria cresce conforme a fonte se expande.</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => { if(confirm("Deseja banir todos os registros desta realidade?")) setManuscripts(INITIAL_MANUSCRIPTS); }} className="text-[10px] uppercase tracking-[0.4em] opacity-20 hover:opacity-100 hover:text-red-500 transition-all font-bold">Banir Todos os Registros</button>
              </div>
            )}
          </main>
        </div>

        {/* FLOAT MENU */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[500px] no-print px-4">
          <nav className={`flex items-center justify-between px-8 py-5 rounded-[32px] border-2 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all ${isDark ? 'bg-black/90 border-gold-faded/20' : 'bg-white/90 border-primary-light/20'}`}>
            <button onClick={() => { setActiveTab('arquivos'); setActiveCategory(null); }} className={`flex flex-col items-center gap-1.5 transition-all hover:scale-110 active:scale-90 ${activeTab === 'arquivos' ? 'opacity-100 scale-110' : 'opacity-25 hover:opacity-60'}`}><span className="material-symbols-outlined text-3xl">history_edu</span><span className="text-[8px] font-bold uppercase tracking-widest">Anais</span></button>
            <button onClick={() => setActiveTab('cofre')} className={`flex flex-col items-center gap-1.5 transition-all hover:scale-110 active:scale-90 ${activeTab === 'cofre' ? 'opacity-100 scale-110' : 'opacity-25 hover:opacity-60'}`}><span className="material-symbols-outlined text-3xl">key</span><span className="text-[8px] font-bold uppercase tracking-widest">Cofre</span></button>
            <div className="relative -top-8"><button onClick={() => setActiveTab('scriptor')} className={`size-20 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-90 shadow-3xl border-[8px] ${isDark ? 'bg-gold-faded text-black border-black/80' : 'bg-primary-light text-white border-white/80'}`}><span className="material-symbols-outlined !text-4xl">add_notes</span></button></div>
            <button onClick={() => setActiveTab('kanban')} className={`flex flex-col items-center gap-1.5 transition-all hover:scale-110 active:scale-90 ${activeTab === 'kanban' ? 'opacity-100 scale-110' : 'opacity-25 hover:opacity-60'}`}><span className="material-symbols-outlined text-3xl">dashboard</span><span className="text-[8px] font-bold uppercase tracking-widest">Kanban</span></button>
            <button onClick={() => setActiveTab('ajustes')} className={`flex flex-col items-center gap-1.5 transition-all hover:scale-110 active:scale-90 ${activeTab === 'ajustes' ? 'opacity-100 scale-110' : 'opacity-25 hover:opacity-60'}`}><span className="material-symbols-outlined text-3xl">tune</span><span className="text-[8px] font-bold uppercase tracking-widest">Ajustes</span></button>
          </nav>
        </div>
      </div>

      {/* OVERLAY VIEWER */}
      {selectedManuscript && (
        <div onClick={() => { setIsOpening(false); setShowShareMenu(false); setTimeout(() => setSelectedManuscript(null), 300); }} className={`fixed inset-0 z-[100] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 transition-all duration-500 ${isOpening ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div onClick={e => e.stopPropagation()} className={`relative w-full max-w-4xl rounded-[48px] overflow-hidden flex flex-col max-h-[92vh] shadow-[0_0_120px_rgba(0,0,0,0.6)] border-2 transition-all duration-700 transform ${isOpening ? 'scale-100 translate-y-0' : 'scale-90 translate-y-20'} ${isDark ? 'bg-[#1a1715] text-gold-faded border-gold-faded/20' : 'bg-[#fcfaf2] text-primary-light border-primary-light/20'}`}>
            <div className="px-10 py-6 border-b-2 border-current/10 flex justify-between items-center bg-current/5">
              <div className="flex gap-8">
                <div className="relative">
                  <button onClick={() => setShowShareMenu(!showShareMenu)} className="opacity-40 hover:opacity-100 transition-opacity flex items-center gap-3 group"><span className="material-symbols-outlined group-hover:scale-110 transition-transform !text-2xl">send</span> <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Compartilhar</span></button>
                  
                  {/* Share Menu Functional UI */}
                  {showShareMenu && (
                    <div className={`absolute top-full left-0 mt-4 w-64 rounded-3xl border-2 shadow-[0_15px_50px_rgba(0,0,0,0.4)] p-3 z-[150] animate-in fade-in slide-in-from-top-6 ${isDark ? 'bg-paper-dark border-gold-faded/20' : 'bg-white border-primary-light/20'}`}>
                      <button onClick={() => shareManuscript('whatsapp')} className="w-full flex items-center gap-5 px-5 py-4 hover:bg-green-500/10 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all">
                        <span className="material-symbols-outlined !text-2xl text-green-500">forum</span> WhatsApp
                      </button>
                      <button onClick={() => shareManuscript('email')} className="w-full flex items-center gap-5 px-5 py-4 hover:bg-blue-500/10 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all">
                        <span className="material-symbols-outlined !text-2xl text-blue-500">alternate_email</span> E-mail
                      </button>
                      <button onClick={() => shareManuscript('pdf')} className="w-full flex items-center gap-5 px-5 py-4 hover:bg-red-500/10 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all">
                        <span className="material-symbols-outlined !text-2xl text-red-500">picture_as_pdf</span> Gerar PDF
                      </button>
                      <div className="h-px bg-current/10 my-2 mx-3" />
                      <button onClick={() => shareManuscript('notion')} className="w-full flex items-center gap-5 px-5 py-4 hover:bg-current/5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all">
                        <span className="material-symbols-outlined !text-2xl">content_paste_go</span> Copiar p/ Notion
                      </button>
                      <button onClick={() => shareManuscript('keep')} className="w-full flex items-center gap-5 px-5 py-4 hover:bg-yellow-500/10 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all">
                        <span className="material-symbols-outlined !text-2xl text-yellow-500">note_add</span> Enviar p/ Keep
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={handlePrint} className="opacity-40 hover:opacity-100 transition-opacity flex items-center gap-3 group"><span className="material-symbols-outlined group-hover:scale-110 transition-transform !text-2xl">print</span> <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Imprimir</span></button>
              </div>
              <button onClick={() => { setIsOpening(false); setShowShareMenu(false); setTimeout(() => setSelectedManuscript(null), 300); }} className="opacity-30 hover:opacity-100 transition-opacity p-3 hover:bg-current/10 rounded-full"><span className="material-symbols-outlined !text-3xl">close</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-16 custom-scrollbar">
              <h2 className="text-5xl font-antique-display mb-12 font-bold leading-tight tracking-tight">{selectedManuscript.title}</h2>
              <div className="font-antique-serif leading-relaxed text-justify opacity-90 rich-content" style={{ fontSize: `${fontSize}px` }} dangerouslySetInnerHTML={{ __html: selectedManuscript.content }} />
              <div className="mt-24 pt-10 border-t-2 border-current/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-bold uppercase tracking-[0.3em] opacity-40 italic">
                <span className="flex items-center gap-2"><span className="material-symbols-outlined !text-sm">calendar_month</span> Registrado em: {selectedManuscript.timestamp}</span>
                <span className="px-5 py-2 border-2 border-current/20 rounded-full bg-current/5">{selectedManuscript.status}</span>
                <span className="flex items-center gap-2">ID: #{selectedManuscript.id.slice(-6)} <span className="material-symbols-outlined !text-sm">fingerprint</span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: currentColor; opacity: 0.1; border-radius: 12px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        [contenteditable]:empty:before { content: attr(data-placeholder); opacity: 0.2; }
        .rich-content img { max-width: 100%; border-radius: 20px; margin: 40px auto; display: block; box-shadow: 0 30px 70px rgba(0,0,0,0.5); border: 1px solid rgba(128,128,128,0.2); }
        .rich-content table { width: 100%; border-collapse: collapse; margin: 30px 0; border: 2px solid currentColor; }
        .rich-content td { border: 1px solid currentColor; padding: 15px; font-size: 0.95em; text-align: center; }
        .rich-content b, .rich-content strong { font-weight: 800; opacity: 1; }
        .rich-content i, .rich-content em { opacity: 0.8; }
        @media print { .no-print { display: none !important; } }
      `}</style>
    </div>
  );
};

export default App;
