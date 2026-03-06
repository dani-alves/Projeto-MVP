"use client";
import { useState, useEffect } from "react";
import { Zap, LayoutGrid, CheckCircle2, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    const res = await fetch("/api/tasks");
    if (res.ok) setTasks(await res.json());
  };

  useEffect(() => { fetchTasks(); }, []);

  const handlePrioritize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao priorizar");
        return;
      }
      setTasks(data);
      setTitle("");
      setDescription("");
    } catch (err) {
      alert("Falha de conexão");
    } finally {
      setLoading(false);
    }
  };

  const Badge = ({ score }: { score: number }) => {
    if (score > 7) return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)] animate-pulse">Urgent</span>;
    if (score >= 4) return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">Medium</span>;
    return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Low</span>;
  };

  return (
    <div className="min-h-screen selection:bg-zinc-800">
      <div className="max-w-3xl mx-auto p-6 md:p-12">
        <header className="mb-16 flex items-center justify-between animate-in" style={{ animationDelay: '0.1s' }}>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-500">
              Priorização Inteligente
            </h1>
            <p className="text-xs text-zinc-500 mt-1 font-medium italic">Engine v1.0 • Gemini 1.5 Powered</p>
          </div>
          <div className="glass p-2 rounded-xl">
            <LayoutGrid size={18} className="text-zinc-500" />
          </div>
        </header>

        <section className="animate-in" style={{ animationDelay: '0.2s' }}>
          <form onSubmit={handlePrioritize} className="glass p-1 rounded-2xl shadow-2xl relative group">
            <div className="p-4 flex flex-col gap-4">
              <input
                placeholder="Qual o objetivo da tarefa?"
                className="bg-transparent border-none focus:ring-0 text-lg font-medium p-0 placeholder:text-zinc-700 outline-none w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Adicione detalhes para a IA analisar o contexto..."
                className="bg-transparent border-none focus:ring-0 text-sm text-zinc-400 min-h-[80px] resize-none p-0 placeholder:text-zinc-800 outline-none w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between p-3 border-t border-white/[0.05] bg-black/40 rounded-b-2xl">
              <div className="flex gap-4 px-2">
                <div className="flex items-center gap-1.5 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                  <TrendingUp size={12} /> Impacto
                </div>
                <div className="flex items-center gap-1.5 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                  <AlertTriangle size={12} /> Urgência
                </div>
              </div>
              <button
                disabled={loading}
                className="bg-white text-black rounded-lg px-6 py-2.5 text-xs font-bold hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {loading ? "Processando..." : <><Zap size={14} fill="currentColor" /> Analisar com IA</>}
              </button>
            </div>
          </form>
        </section>

        <div className="mt-12 flex flex-col gap-4">
          {tasks.length > 0 && (
            <div className="flex items-center justify-between px-2 mb-2 animate-in" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Fila de Prioridades</h2>
              <div className="h-px flex-1 mx-4 bg-zinc-900"></div>
              <span className="text-[10px] font-mono text-zinc-600">{tasks.length} itens</span>
            </div>
          )}

          {tasks.map((task, i) => (
            <div
              key={task.id}
              className="glass p-5 rounded-2xl glass-hover transition-all animate-in group relative overflow-hidden"
              style={{ animationDelay: `${0.4 + (i * 0.1)}s` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] blur-3xl -mr-16 -mt-16 group-hover:bg-white/[0.05] transition-colors"></div>

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-base text-zinc-100 group-hover:text-white transition-colors flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                    {task.title}
                  </h3>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter leading-none">Global Score</span>
                      <span className="text-xl font-bold font-mono tracking-tighter text-white">{task.score.toFixed(1)}</span>
                    </div>
                    <Badge score={task.score} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <p className="text-xs text-zinc-400 leading-relaxed font-medium bg-white/[0.01] p-3 rounded-lg border border-white/[0.03]">
                  {task.description}
                </p>

                <div className="flex items-start gap-2 bg-zinc-900/40 p-3 rounded-xl border border-white/[0.02]">
                  <ArrowRight size={12} className="text-zinc-700 mt-1 shrink-0" />
                  <p className="text-[11px] text-zinc-500 italic font-medium leading-normal">
                    <span className="text-zinc-400 not-italic uppercase font-bold text-[9px] mr-1">IA Verdict:</span>
                    "{task.justificativa}"
                  </p>
                </div>
              </div>
            </div>
          ))}

          {tasks.length === 0 && !loading && (
            <div className="text-center py-24 glass rounded-3xl border-dashed border-2 animate-in">
              <div className="bg-zinc-900 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutGrid className="text-zinc-700" size={20} />
              </div>
              <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Aguardando sua primeira tarefa</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
