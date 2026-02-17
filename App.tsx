
import React, { useState, useEffect, useCallback } from 'react';
import { Session, MantraStats, Inspiration } from './types';
import { TARGET_TOTAL, PRESETS, DEFAULT_MANTRA, STORAGE_KEY, COMMON_MANTRAS } from './constants';
import { getSpiritualInspiration } from './services/geminiService';
import ProgressRing from './components/ProgressRing';

const App: React.FC = () => {
  const [stats, setStats] = useState<MantraStats>({
    totalCount: 0,
    targetCount: TARGET_TOTAL,
    currentMantra: DEFAULT_MANTRA,
    history: []
  });

  const [sessionCount, setSessionCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inspiration, setInspiration] = useState<Inspiration | null>(null);
  const [isLoadingInspiration, setIsLoadingInspiration] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  const fetchInspiration = useCallback(async (mantra: string) => {
    setIsLoadingInspiration(true);
    const result = await getSpiritualInspiration(mantra);
    if (result) {
      setInspiration({ ...result, loading: false });
    }
    setIsLoadingInspiration(false);
  }, []);

  useEffect(() => {
    fetchInspiration(stats.currentMantra);
  }, [stats.currentMantra, fetchInspiration]);

  const incrementCount = () => {
    setSessionCount(prev => prev + 1);
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const completeSession = (overrideCount?: number) => {
    const finalCount = overrideCount !== undefined ? overrideCount : sessionCount;
    if (finalCount <= 0) return;

    const newSession: Session = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      count: finalCount,
      mantra: stats.currentMantra
    };

    setStats(prev => ({
      ...prev,
      totalCount: prev.totalCount + finalCount,
      history: [newSession, ...prev.history].slice(0, 50)
    }));
    
    setSessionCount(0);
    setIsMenuOpen(false);
  };

  const resetProgress = () => {
    if (window.confirm("Are you sure you want to reset all your progress? This cannot be undone.")) {
      setStats({
        totalCount: 0,
        targetCount: TARGET_TOTAL,
        currentMantra: DEFAULT_MANTRA,
        history: []
      });
      setSessionCount(0);
    }
  };

  const changeMantra = (m: string) => {
    setStats(prev => ({ ...prev, currentMantra: m }));
    setSessionCount(0);
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-gray-800 pb-20 selection:bg-orange-100">
      <header className="px-6 py-8 flex flex-col items-center border-b border-orange-100 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <h1 className="font-serif text-3xl text-orange-900 mb-1">MantraPath</h1>
        <p className="text-gray-400 text-[10px] tracking-[0.2em] uppercase font-bold">Sacred Repetitions</p>
      </header>

      <main className="max-w-md mx-auto px-6 mt-8 space-y-8">
        
        {/* Progress Overview */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-orange-50 flex flex-col items-center transition-all hover:shadow-md">
          <ProgressRing current={stats.totalCount} target={stats.targetCount} />
          
          <div className="mt-6 text-center">
            <h2 className="text-5xl font-bold text-gray-900 tracking-tight">{stats.totalCount.toLocaleString()}</h2>
            <p className="text-gray-400 text-xs mt-2 font-medium uppercase tracking-widest">Total of {stats.targetCount.toLocaleString()}</p>
          </div>

          <div className="w-full mt-8 grid grid-cols-2 gap-4">
            <div className="bg-orange-50/50 p-5 rounded-[1.5rem] text-center">
              <span className="block text-orange-900 font-bold text-2xl">{stats.history.length}</span>
              <span className="text-[10px] text-orange-700 font-bold uppercase tracking-wider">Sessions</span>
            </div>
            <div className="bg-orange-50/50 p-5 rounded-[1.5rem] text-center">
              <span className="block text-orange-900 font-bold text-2xl">{Math.max(0, stats.targetCount - stats.totalCount).toLocaleString()}</span>
              <span className="text-[10px] text-orange-700 font-bold uppercase tracking-wider">Remaining</span>
            </div>
          </div>
        </div>

        {/* Counter Area */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2 px-1">
            <div className="flex flex-col">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Focusing on</p>
              <h3 className="font-serif text-xl italic text-gray-800">{stats.currentMantra}</h3>
            </div>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-orange-100 text-orange-800 p-2 rounded-full hover:bg-orange-200 transition-colors"
              title="Change Mantra"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-3.92-5.59-3.92-5.98 0H11.49zM2.866 6.85c1.282 0 2.381-.825 2.783-1.97a.5.5 0 00-.461-.666l-4.144.001a.5.5 0 00-.463.665c.402 1.146 1.501 1.97 2.785 1.97zM17.134 6.85c-1.282 0-2.381-.825-2.783-1.97a.5.5 0 01.461-.666l4.144.001a.5.5 0 01.463.665c-.402 1.146-1.501 1.97-2.785 1.97zM6.19 8.647a.75.75 0 100 1.5 8.25 8.25 0 001.5 16.5.75.75 0 100-1.5 6.75 6.75 0 110-13.5.75.75 0 000-1.5zm1.5-3.15a.75.75 0 110 1.5.75.75 0 010-1.5zm6.5 0a.75.75 0 110 1.5.75.75 0 010-1.5z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {isMenuOpen && (
            <div className="bg-white rounded-3xl p-5 shadow-2xl border border-orange-100 animate-in fade-in slide-in-from-top-4 duration-300">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Select or Enter Mantra</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {COMMON_MANTRAS.map(m => (
                  <button
                    key={m}
                    onClick={() => { changeMantra(m); setIsMenuOpen(false); }}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${stats.currentMantra === m ? 'bg-orange-800 text-white shadow-lg' : 'bg-gray-50 hover:bg-orange-50 text-gray-700'}`}
                  >
                    {m}
                  </button>
                ))}
                <div className="pt-2 border-t mt-2">
                   <input 
                    type="text" 
                    placeholder="Enter custom mantra..."
                    className="w-full p-4 rounded-2xl bg-gray-50 border-none text-sm focus:ring-2 focus:ring-orange-200 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if(val) changeMantra(val);
                        (e.target as HTMLInputElement).value = '';
                        setIsMenuOpen(false);
                      }
                    }}
                   />
                </div>
              </div>
            </div>
          )}

          <div 
            onClick={incrementCount}
            className="tap-active h-72 bg-white rounded-[3rem] border-4 border-orange-100 shadow-xl flex flex-col items-center justify-center cursor-pointer select-none relative overflow-hidden transition-all active:shadow-inner active:border-orange-200"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-orange-50/30 to-transparent pointer-events-none"></div>
            <span className="text-9xl font-black text-orange-900/90 mb-2 z-10 transition-transform">{sessionCount}</span>
            <span className="text-gray-300 uppercase tracking-[0.3em] font-bold text-[10px] z-10">Touch Center</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => completeSession(p)}
                className="bg-white border border-orange-100 p-5 rounded-3xl font-bold text-orange-900 hover:bg-orange-800 hover:text-white transition-all tap-active flex flex-col items-center group shadow-sm"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">+{p}</span>
                <span className="text-[10px] uppercase opacity-50 font-black tracking-tighter">Preset</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => completeSession()}
            disabled={sessionCount === 0}
            className="w-full bg-orange-900 text-white py-6 rounded-3xl font-bold text-xl shadow-xl hover:bg-black disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transition-all tap-active uppercase tracking-widest"
          >
            Seal Session ({sessionCount})
          </button>
        </div>

        {/* AI Inspiration */}
        {(inspiration || isLoadingInspiration) && (
          <div className="bg-gradient-to-br from-[#fffdfa] to-orange-50/30 rounded-[2.5rem] p-8 border border-orange-100/50 shadow-inner relative overflow-hidden">
             {isLoadingInspiration ? (
               <div className="space-y-4 animate-pulse">
                 <div className="h-4 bg-orange-100 rounded w-3/4"></div>
                 <div className="h-4 bg-orange-100 rounded w-full"></div>
                 <div className="h-2 bg-orange-50 rounded w-1/2"></div>
               </div>
             ) : (
               <>
                 <div className="absolute -top-4 -right-4 text-orange-100/50 transform rotate-12 scale-150">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V12C14.017 12.5523 13.5693 13 13.017 13H11.017C10.4647 13 10.017 12.5523 10.017 12V9C10.017 7.34315 11.3601 6 13.017 6H19.017C20.6738 6 22.017 7.34315 22.017 9V15C22.017 16.6569 20.6738 18 19.017 18H17.017C16.4647 18 16.017 18.4477 16.017 19V21L14.017 21ZM4.017 21L4.017 18C4.017 16.8954 4.9124 16 6.017 16H9.017C9.5693 16 10.017 15.5523 10.017 15V9C10.017 8.44772 9.5693 8 9.017 8H5.017C4.4647 8 4.017 8.44772 4.017 9V12C4.017 12.5523 3.5693 13 3.017 13H1.017C0.464724 13 0.0170166 12.5523 0.0170166 12V9C0.0170166 7.34315 1.36016 6 3.01702 6H9.017C10.6738 6 12.017 7.34315 12.017 9V15C12.017 16.6569 10.6738 18 9.017 18H7.017C6.46472 18 6.01702 18.4477 6.01702 19V21L4.017 21Z" />
                    </svg>
                 </div>
                 <p className="font-serif text-xl italic leading-relaxed text-orange-900 mb-6 relative z-10">"{inspiration?.quote}"</p>
                 <div className="h-[2px] bg-orange-100/50 w-8 mb-4"></div>
                 <p className="text-xs font-medium text-gray-500 uppercase tracking-widest leading-loose relative z-10">{inspiration?.meaning}</p>
               </>
             )}
          </div>
        )}

        {/* Recent History */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-4">
            <h3 className="font-black text-gray-400 uppercase tracking-widest text-[10px]">Recent Sessions</h3>
            <button onClick={resetProgress} className="text-red-300 text-[10px] hover:text-red-500 transition-colors uppercase font-black tracking-widest">Clear Data</button>
          </div>
          
          <div className="space-y-3">
            {stats.history.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-10 text-center border border-dashed border-orange-100">
                <p className="text-gray-400 text-xs italic">A journey of 11,111 begins with a single tap.</p>
              </div>
            ) : (
              stats.history.map(session => (
                <div key={session.id} className="bg-white p-5 rounded-[1.5rem] flex items-center justify-between border border-orange-50 shadow-sm transition-transform hover:scale-[1.01]">
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm">{session.mantra}</h5>
                    <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">
                      {new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="bg-orange-800 text-white font-black px-4 py-2 rounded-2xl text-xs shadow-md">
                    +{session.count}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      <footer className="mt-16 text-center text-gray-400 text-[10px] pb-10 px-6 uppercase tracking-[0.2em] font-medium">
        <p className="mb-2">Encrypted in Local Browser Storage</p>
        <p className="italic font-serif normal-case text-orange-300 text-sm">"Peace is every step."</p>
      </footer>
    </div>
  );
};

export default App;
