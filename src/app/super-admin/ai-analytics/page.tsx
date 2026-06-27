"use client";
import { useState, useRef, useEffect } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Button } from "@/components/ui/Button";
import { BarChartComponent } from "@/components/charts/BarChart";
import { suggestedQuestions, aiResponses } from "@/lib/mock-data/ai-responses";
import type { AIMessage } from "@/lib/mock-data/ai-responses";
import { Send, Bot, Sparkles, BarChart2, Table2, CreditCard, User, Shield, Wallet, FlaskConical, FileText, TrendingUp, Copy, Check, RefreshCw, Download } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const iconMap: Record<string, React.ReactNode> = {
  users: <User className="w-4 h-4" />,
  user: <User className="w-4 h-4" />,
  shield: <Shield className="w-4 h-4" />,
  wallet: <Wallet className="w-4 h-4" />,
  flask: <FlaskConical className="w-4 h-4" />,
  file: <FileText className="w-4 h-4" />,
  rupee: <span className="text-xs font-bold">₹</span>,
  "trending-up": <TrendingUp className="w-4 h-4" />,
};

function SummaryCards({ cards }: { cards: { label: string; value: string | number; icon: string }[] }) {
  return (
    <div className={`grid gap-3 mt-3 ${cards.length <= 2 ? "grid-cols-2" : cards.length <= 4 ? "grid-cols-2" : "grid-cols-3"}`}>
      {cards.map(c => (
        <div key={c.label} className="bg-[#0d1526] border border-[#1f2d45] rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">{iconMap[c.icon] ?? <BarChart2 className="w-4 h-4" />}</div>
          <div>
            <div className="text-base font-bold text-white">{c.value}</div>
            <div className="text-xs text-slate-500">{c.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TableResult({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-[#1f2d45]">
      <table className="vita-table w-full">
        <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{String(c)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function MessageBubble({ message }: { message: AIMessage }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === "user") {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-[#111827] border border-[#1f2d45] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%]">
          <p className="text-sm text-slate-200">{message.content}</p>
          {message.summaryCards && <SummaryCards cards={message.summaryCards} />}
          {message.tableData && <TableResult {...message.tableData} />}
          {message.chartData && (
            <div className="mt-3 bg-[#0d1526] rounded-xl p-4 border border-[#1f2d45]">
              <BarChartComponent data={message.chartData.data} title={message.chartData.title} color="#2563eb" height={200} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1.5 ml-1">
          <button onClick={handleCopy} className="text-slate-600 hover:text-slate-400 transition-colors">
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
          <button className="text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1">
            <Download className="w-3 h-3" /> Export
          </button>
          <span className="text-xs text-slate-600">{new Date(message.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>
    </div>
  );
}

export default function AIAnalyticsPage() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your Vita Analytics AI. Ask me anything about users, hospitals, appointments, memberships, wallet credits, or any other platform data. You can use natural language — I'll understand!",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: AIMessage = { id: `u${Date.now()}`, role: "user", content: text, timestamp: new Date().toISOString() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    const key = text.toLowerCase().trim();
    const match = Object.keys(aiResponses).find(k => key.includes(k) || k.includes(key.split(" ").slice(0, 3).join(" ")));
    const response: AIMessage = match
      ? { ...aiResponses[match], id: `a${Date.now()}`, timestamp: new Date().toISOString() }
      : {
          id: `a${Date.now()}`, role: "assistant", timestamp: new Date().toISOString(),
          content: `I've processed your query about "${text}". Based on current platform data, I found ${Math.floor(Math.random() * 5000 + 1000).toLocaleString()} relevant records. For a more specific breakdown, please refine your query with date ranges or entity filters.`,
          responseType: "text",
        };
    setMessages(m => [...m, response]);
    setLoading(false);
  };

  const clearChat = () => setMessages([{
    id: "welcome",
    role: "assistant",
    content: "Hello! I'm your Vita Analytics AI. Ask me anything about users, hospitals, appointments, memberships, wallet credits, or any other platform data. You can use natural language — I'll understand!",
    timestamp: new Date().toISOString(),
  }]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader
        title="AI Analytics Assistant"
        subtitle="Natural language queries powered by Vita Intelligence"
        role="super-admin"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-blue-300 rounded-full border border-blue-500/20 animate-pulse-glow">
              <Sparkles className="w-3 h-3" /> AI Online
            </div>
            <Button variant="ghost" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={clearChat}>Clear</Button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 73px)" }}>
        {/* Suggested Questions Sidebar */}
        <div className="w-64 border-r border-[#1f2d45] bg-[#0d1526]/80 flex-shrink-0 flex flex-col">
          <div className="p-4 border-b border-[#1f2d45]">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Suggested Queries</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {suggestedQuestions.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)} className="w-full text-left text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 px-3 py-2.5 rounded-lg transition-colors border border-transparent hover:border-[#1f2d45] leading-relaxed">
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}

              {loading && (
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-[#111827] border border-[#1f2d45] rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-[#1f2d45] p-4 bg-[#0d1526]/80 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                  placeholder="Ask anything — e.g. 'Show Gold members who joined this month' or 'Top hospitals by appointments'"
                  className="vita-input pr-12 py-3"
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Sparkles className="w-4 h-4 text-blue-400/50" />
                </div>
              </div>
              <Button onClick={() => sendMessage(input)} loading={loading} icon={<Send className="w-4 h-4" />} className="px-5 py-3">Send</Button>
            </div>
            <p className="text-center text-xs text-slate-600 mt-2">AI responses are based on mock platform data for demonstration purposes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
