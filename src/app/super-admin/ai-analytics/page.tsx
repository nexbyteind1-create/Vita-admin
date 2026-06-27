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
    <div className={`grid gap-3 mt-3 ${cards.length <= 2 ? "grid-cols-1 sm:grid-cols-2" : cards.length <= 4 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
      {cards.map(c => (
        <div key={c.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg text-red-600">{iconMap[c.icon] ?? <BarChart2 className="w-4 h-4" />}</div>
          <div>
            <div className="text-base font-bold text-slate-900">{c.value}</div>
            <div className="text-xs text-slate-500">{c.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TableResult({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
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
        <div className="max-w-[85%] sm:max-w-[70%] bg-red-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-full sm:max-w-[90%]">
          <p className="text-sm text-slate-900">{message.content}</p>
          {message.summaryCards && <SummaryCards cards={message.summaryCards} />}
          {message.tableData && <TableResult {...message.tableData} />}
          {message.chartData && (
            <div className="mt-3 bg-white rounded-xl p-4 border border-slate-200">
              <BarChartComponent data={message.chartData.data} title={message.chartData.title} color="#2563eb" height={200} />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1.5 ml-1">
          <button onClick={handleCopy} className="text-slate-400 hover:text-slate-600 transition-colors">
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          </button>
          <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">
            <Download className="w-3 h-3" /> Export
          </button>
          <span className="text-xs text-slate-400">{new Date(message.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
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
            <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-gradient-to-r from-red-50 to-emerald-50 text-red-700 rounded-full border border-red-200 animate-pulse-glow">
              <Sparkles className="w-3 h-3" /> AI Online
            </div>
            <Button variant="ghost" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={clearChat}>Clear</Button>
          </div>
        }
      />

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden" style={{ height: "calc(100vh - 73px)" }}>
        {/* Suggested Questions Sidebar */}
        <div className="hidden lg:flex w-64 border-r border-slate-200 bg-slate-50/80 flex-shrink-0 flex-col">
          <div className="p-4 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suggested Queries</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {suggestedQuestions.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)} className="w-full text-left text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-3 py-2.5 rounded-lg transition-colors border border-transparent hover:border-slate-200 leading-relaxed">
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
              {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}

              {loading && (
                <div className="flex items-start gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-4 bg-slate-50/80 backdrop-blur-sm">
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
                  <Sparkles className="w-4 h-4 text-red-400/50" />
                </div>
              </div>
              <Button onClick={() => sendMessage(input)} loading={loading} icon={<Send className="w-4 h-4" />} className="px-5 py-3">Send</Button>
            </div>
            <p className="text-center text-xs text-slate-400 mt-2">AI responses are based on mock platform data for demonstration purposes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
