"use client";
import { useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { ExportMenu } from "@/components/ui/ExportMenu";
import { Badge } from "@/components/ui/Badge";
import { userWallets } from "@/lib/mock-data/wallet";
import { formatDate, formatNumber, formatDateTime } from "@/lib/utils/format";
import type { UserWallet, WalletTransaction } from "@/lib/types/wallet";
import { Wallet, TrendingUp, XCircle, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";

function TransactionRow({ t }: { t: WalletTransaction }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[#1f2d45] last:border-0">
      <div className={`p-2 rounded-lg flex-shrink-0 ${t.type === "credit" ? "bg-emerald-500/10" : t.type === "expired" ? "bg-slate-500/10" : "bg-red-500/10"}`}>
        {t.type === "credit" ? <ArrowDownLeft className="w-4 h-4 text-emerald-400" /> : t.type === "expired" ? <Clock className="w-4 h-4 text-slate-400" /> : <ArrowUpRight className="w-4 h-4 text-red-400" />}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-200">{t.description}</div>
        <div className="text-xs text-slate-500">{t.source} · {formatDate(t.date)}</div>
      </div>
      <div className={`font-bold text-sm ${t.type === "credit" ? "text-emerald-400" : "text-red-400"}`}>
        {t.type === "credit" ? "+" : "-"}{formatNumber(t.amount)}
      </div>
      <Badge variant={t.status === "completed" ? "active" : "pending"} label={t.status} size="sm" />
    </div>
  );
}

export default function WalletUsersPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<UserWallet | null>(null);

  const filtered = userWallets.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.uhid.toLowerCase().includes(query.toLowerCase()) ||
    u.mobile.includes(query)
  );

  return (
    <div className="min-h-screen">
      <TopHeader title="User Wallets" subtitle="Search and view individual wallet balances and transactions" role="super-admin" actions={<ExportMenu reportName="User Wallets" />} />
      <div className="p-6 space-y-6 max-w-[1600px]">
        <SearchInput placeholder="Search by UHID, mobile, or name..." onSearch={setQuery} className="max-w-lg" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="space-y-3">
            {filtered.map(u => (
              <div key={u.userId} onClick={() => setSelected(u)} className={`glass-card p-4 cursor-pointer hover:-translate-y-0.5 transition-all ${selected?.userId === u.userId ? "border-blue-500/50 glow-blue" : ""}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.uhid} · {u.mobile}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-400">{formatNumber(u.balance)}</div>
                    <div className="text-xs text-slate-500">Credits</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
                  <div><div className="text-slate-200 font-semibold">{formatNumber(u.totalEarned)}</div><div className="text-slate-500">Earned</div></div>
                  <div><div className="text-slate-400 font-semibold">{formatNumber(u.totalRedeemed)}</div><div className="text-slate-500">Redeemed</div></div>
                  <div><div className="text-red-400 font-semibold">{formatNumber(u.totalExpired)}</div><div className="text-slate-500">Expired</div></div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail */}
          {selected ? (
            <div className="lg:col-span-2 space-y-4">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div><h2 className="text-lg font-bold text-white">{selected.name}</h2><p className="text-sm text-slate-400">{selected.uhid} · {selected.mobile}</p></div>
                  <div className="text-right"><div className="text-3xl font-extrabold text-emerald-400">{formatNumber(selected.balance)}</div><div className="text-xs text-slate-500 mt-0.5">Wallet Balance</div></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass-card p-4 text-center"><div className="text-xl font-bold text-white">{formatNumber(selected.totalEarned)}</div><div className="text-xs text-slate-500 mt-1">Total Earned</div></div>
                  <div className="glass-card p-4 text-center"><div className="text-xl font-bold text-slate-400">{formatNumber(selected.totalRedeemed)}</div><div className="text-xs text-slate-500 mt-1">Redeemed</div></div>
                  <div className="glass-card p-4 text-center"><div className="text-xl font-bold text-red-400">{formatNumber(selected.totalExpired)}</div><div className="text-xs text-slate-500 mt-1">Expired</div></div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Transaction History</h3>
                {selected.transactions.map(t => <TransactionRow key={t.id} t={t} />)}
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 flex items-center justify-center glass-card min-h-[300px]">
              <div className="text-center"><div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4"><Wallet className="w-8 h-8 text-slate-600" /></div><p className="text-slate-400 text-sm">Select a user to view wallet details</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
