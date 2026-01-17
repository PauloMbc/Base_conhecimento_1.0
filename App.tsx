
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
    const url = window.prompt("Cole o link direto da imagem aqui:", "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80");
    if (url) {
      const imgHtml = `<img src="${url}" style="max-width: 100%; border-radius: 12px; margin: 15px 0; display: block; border: 2px solid rgba(128,128,128,0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.2);" /><br/>`;
      execCmd('insertHTML', imgHtml);
    }
  };

  const shareOnPlatform = async (platform: string) => {
    if (!selectedManuscript) return;
    
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = selectedManuscript.content;
    const textOnly = tempDiv.innerText || tempDiv.textContent || "";
    const shareText = `📜 *${selectedManuscript.title.toUpperCase()}*\n\n${textOnly}\n\n— Registro do Códice Arcano`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(selectedManuscript.title)}&body=${encodeURIComponent(shareText)}`;
        break;
      case 'pdf':
        window.print();
        break;
      case 'notion':
      case 'keep':
        try {
          await navigator.clipboard.writeText(shareText);
          alert(`Conteúdo copiado! Abrindo ${platform}... Cole (Ctrl+V) sua nota lá.`);
          window.open(platform === 'notion' ? 'https://www.notion.so' : 'https://keep.google.com', '_blank');
        } catch (err) {
          alert('Erro ao copiar conteúdo.');
        }
        break;
    }
    setShowShareMenu(false);
  };

  const handleScribe = async () => {
    const manualContent = editorRef.current?.innerHTML || "";
    setIsScribing(true);
    
    if (manualContent.length > 10 || manualContent.includes('<img')) {
      const manuscript: Manuscript = {
        id: Date.now().toString(),
        category: activeCategory || 'Original',
        title: newTitle || "Novo Fragmento",
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
      const newEntry = await generateArcaneInsights(newTitle || "Sabedoria Digital");
      if (newEntry) {
        setManuscripts(prev => [{
          id: Date.now().toString(),
          category: newEntry.category,
          title: newEntry.title,
          content: newEntry.content,
          timestamp: new Date().toLocaleDateString('pt-BR'),
          status: newEntry.metadata
        }, ...prev]);
        setNewTitle('');
        setActiveTab('arquivos');
      }
    }
    setIsScribing(false);
  };

  const filteredManuscripts = manuscripts.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(m => activeCategory ? (m.category === activeCategory || m.tags?.includes(activeCategory)) : true);

  return (
    <div className={`min-h-screen w-full flex flex-col justify-center items-center p-0 md:p-6 transition-all duration-700 ${isDark ? 'bg-[#0a0505]' : 'bg-[#f6f3e9]'}`}>
      <div className={`relative flex h-screen md:h-[94vh] w-full max-w-6xl flex-col md:flex-row overflow-hidden shadow-2xl md:rounded-[40px] border transition-all duration-700 ${isDark ? 'leather-texture border-black/80' : 'parchment-texture border-[#4a2c2e]/20'}`}>
        
        {/* SIDEBAR */}
        <div className="w-full md:w-1/3 flex flex-col border-b md:border-b-0 md:border-r border-black/10 h-[35vh] md:h-full z-10 no-print">
          <header className="pt-10 px-8 pb-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-antique-display font-bold tracking-[0.2em] transition-all ${isDark ? 'text-gold-faded' : 'text-primary-light'}`}>CÓDICE</h1>
              <button onClick={toggleTheme} className="size-10 rounded-full border border-current/10 flex items-center justify-center hover:bg-current/5 transition-all">
                <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
              </button>
            </div>
            <div className={`flex items-center rounded-2xl px-4 h-12 border ${isDark ? 'bg-black/40 border-gold-faded/20' : 'bg-white/50 border-primary-light/20'}`}>
              <span className="material-symbols-outlined opacity-30 mr-2">search</span>
              <input className="bg-transparent border-none focus:ring-0 w-full p-0 font-antique-serif italic" placeholder="Pesquisar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </header>
          <div className="flex-1 overflow-y-auto px-6 custom-scrollbar pb-10">
            <LearningPath theme={theme} onStepClick={l => { setActiveCategory(l); setActiveTab('arquivos'); }} />
            <div className="h-px w-full bg-current opacity-5 my-6" />
            <ManuscriptTree theme={theme} onItemClick={l => { setActiveCategory(l); setActiveTab('arquivos'); }} />
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="w-full md:w-2/3 flex flex-col overflow-hidden h-[65vh] md:h-full relative">
          <main className="flex-1 overflow-y-auto px-6 md:px-12 py-10 custom-scrollbar pb-32">
            {activeTab === 'arquivos' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-500">
                {filteredManuscripts.map(m => (
                  <div key={m.id} onClick={() => { setSelectedManuscript(m); setIsOpening(true); }} className={`aged-card p-6 rounded-3xl border cursor-pointer hover:-translate-y-1 transition-all ${isDark ? 'bg-black/30 border-gold-faded/10 text-gold-faded' : 'bg-white/60 border-primary-light/10 text-primary-light'}`}>
                    <span className="text-[8px] uppercase font-bold tracking-widest opacity-50">{m.category}</span>
                    <h3 className="font-antique-display text-lg my-2 font-bold">{m.title}</h3>
                    <div className="text-xs line-clamp-3 opacity-70 font-antique-serif italic" dangerouslySetInnerHTML={{ __html: m.content }} />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'scriptor' && (
              <div className={`p-8 rounded-[32px] border flex flex-col h-full shadow-xl animate-in fade-in ${isDark ? 'bg-black/60 border-gold-faded/20' : 'bg-white/80 border-primary-light/20'}`}>
                <div className="flex gap-4 mb-6">
                  <button onClick={() => execCmd('bold')} className="p-2 hover:bg-current/10 rounded-lg material-symbols-outlined">format_bold</button>
                  <button onClick={handleInsertImage} className="p-2 hover:bg-current/10 rounded-lg material-symbols-outlined">image</button>
                </div>
                <input placeholder="Título..." value={newTitle} onChange={e => setNewTitle(e.target.value)} className="bg-transparent border-b border-current/10 mb-6 py-2 text-2xl font-antique-display focus:ring-0 focus:border-current/40" />
                <div ref={editorRef} contentEditable className="flex-1 font-antique-serif text-xl focus:outline-none overflow-y-auto custom-scrollbar" data-placeholder="Comece sua escrita..." />
                <button onClick={handleScribe} disabled={isScribing} className={`mt-6 h-14 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isDark ? 'bg-gold-faded text-black' : 'bg-primary-light text-white'}`}>
                  {isScribing ? 'Sincronizando...' : 'Eternizar'}
                </button>
              </div>
            )}
            
            {activeTab === 'ajustes' && (
              <div className="flex flex-col items-center justify-center h-full gap-8">
                <h2 className="text-2xl font-antique-display">Ajustes do Tomo</h2>
                <div className="w-full max-w-xs space-y-4">
                  <p className="text-xs uppercase tracking-widest opacity-50">Tamanho da Letra</p>
                  <input type="range" min="14" max="32" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full accent-current" />
                </div>
              </div>
            )}
          </main>
        </div>

        {/* FLOAT NAV */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm no-print">
          <nav className={`flex items-center justify-between px-6 py-4 rounded-full border backdrop-blur-xl shadow-2xl ${isDark ? 'bg-black/80 border-gold-faded/20' : 'bg-white/80 border-primary-light/20'}`}>
            <button onClick={() => setActiveTab('arquivos')} className={`material-symbols-outlined ${activeTab === 'arquivos' ? 'opacity-100' : 'opacity-30'}`}>auto_stories</button>
            <button onClick={() => setActiveTab('scriptor')} className={`size-12 rounded-full flex items-center justify-center shadow-lg transform active:scale-95 ${isDark ? 'bg-gold-faded text-black' : 'bg-primary-light text-white'}`}><span className="material-symbols-outlined">add</span></button>
            <button onClick={() => setActiveTab('ajustes')} className={`material-symbols-outlined ${activeTab === 'ajustes' ? 'opacity-100' : 'opacity-30'}`}>settings</button>
          </nav>
        </div>
      </div>

      {/* VIEWER OVERLAY */}
      {selectedManuscript && (
        <div onClick={() => { setIsOpening(false); setShowShareMenu(false); setTimeout(() => setSelectedManuscript(null), 300); }} className={`fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 transition-all duration-300 ${isOpening ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div onClick={e => e.stopPropagation()} className={`w-full max-w-2xl rounded-[40px] overflow-hidden flex flex-col max-h-[85vh] shadow-2xl border ${isDark ? 'bg-[#1a1715] text-gold-faded border-gold-faded/20' : 'bg-[#fcfaf2] text-primary-light border-primary-light/20'}`}>
            <div className="px-8 py-4 border-b border-current/10 flex justify-between items-center bg-current/5 no-print">
              <div className="flex gap-4 relative">
                <button onClick={() => setShowShareMenu(!showShareMenu)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-50 hover:opacity-100">
                  <span className="material-symbols-outlined !text-sm">share</span> Compartilhar
                </button>
                {showShareMenu && (
                  <div className={`absolute top-full left-0 mt-2 w-48 rounded-2xl border shadow-2xl p-2 z-[110] animate-in slide-in-from-top-2 ${isDark ? 'bg-black border-gold-faded/20' : 'bg-white border-primary-light/20'}`}>
                    <button onClick={() => shareOnPlatform('whatsapp')} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-current/5 rounded-lg flex items-center gap-3"><span className="material-symbols-outlined !text-sm text-green-500">chat</span> WhatsApp</button>
                    <button onClick={() => shareOnPlatform('email')} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-current/5 rounded-lg flex items-center gap-3"><span className="material-symbols-outlined !text-sm text-blue-500">mail</span> Email</button>
                    <button onClick={() => shareOnPlatform('pdf')} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-current/5 rounded-lg flex items-center gap-3"><span className="material-symbols-outlined !text-sm text-red-500">picture_as_pdf</span> PDF / Imprimir</button>
                    <button onClick={() => shareOnPlatform('notion')} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-current/5 rounded-lg flex items-center gap-3"><span className="material-symbols-outlined !text-sm">inventory</span> Notion</button>
                    <button onClick={() => shareOnPlatform('keep')} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-current/5 rounded-lg flex items-center gap-3"><span className="material-symbols-outlined !text-sm text-yellow-500">notes</span> Keep</button>
                  </div>
                )}
              </div>
              <button onClick={() => { setIsOpening(false); setSelectedManuscript(null); }} className="material-symbols-outlined opacity-30">close</button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <h2 className="text-3xl font-antique-display mb-8 font-bold leading-tight">{selectedManuscript.title}</h2>
              <div className="font-antique-serif leading-relaxed text-justify opacity-90 rich-content" style={{ fontSize: `${fontSize}px` }} dangerouslySetInnerHTML={{ __html: selectedManuscript.content }} />
              <div className="mt-12 pt-6 border-t border-current/10 flex justify-between text-[10px] font-bold opacity-30 italic">
                <span>Criado em: {selectedManuscript.timestamp}</span>
                <span>{selectedManuscript.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: currentColor; opacity: 0.1; border-radius: 10px; }
        [contenteditable]:empty:before { content: attr(data-placeholder); opacity: 0.2; }
        .rich-content img { max-width: 100%; border-radius: 12px; margin: 20px 0; border: 1px solid currentColor; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
      `}</style>
    </div>
  );
};

export default App;
