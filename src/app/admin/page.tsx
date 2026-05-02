"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  MessageSquare, 
  ShoppingBag, 
  Database, 
  TrendingUp, 
  Activity,
  Settings,
  ChevronRight,
  Shield,
  Zap,
  Globe,
  Bell,
  Plus,
  LogOut,
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  Mail,
  Lock,
  Sliders,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type Tab = 'overview' | 'activity' | 'users' | 'settings';

const MOCK_USERS = [
  { id: 1, name: 'Alice Johnson', email: 'alice@acme.com', role: 'ADMIN', status: 'active' },
  { id: 2, name: 'Bob Smith', email: 'bob@acme.com', role: 'MEMBER', status: 'active' },
  { id: 3, name: 'Carol White', email: 'carol@acme.com', role: 'MEMBER', status: 'inactive' },
  { id: 4, name: 'David Lee', email: 'david@acme.com', role: 'MEMBER', status: 'active' },
  { id: 5, name: 'Eva Brown', email: 'eva@acme.com', role: 'MEMBER', status: 'active' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [integrations, setIntegrations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats] = useState({
    usersCount: 124,
    conversationCount: 842,
    activeSessions: 12,
    revenue: '$48,290'
  });

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) throw new Error('Auth failed');
        const userData = await userRes.json();
        setUser(userData);
        await fetchIntegrations(userData.projectId);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchIntegrations = async (pId: string) => {
    const res = await fetch(`/api/integrations?projectId=${pId}`);
    const data = await res.json();
    setIntegrations(data);
  };

  const toggleIntegration = async (type: 'shopify' | 'crm') => {
    if (!user) return;
    const payload = {
      projectId: user.projectId,
      shopifyEnabled: type === 'shopify' ? !integrations?.shopifyEnabled : integrations?.shopifyEnabled,
      crmEnabled: type === 'crm' ? !integrations?.crmEnabled : integrations?.crmEnabled,
    };
    const res = await fetch('/api/integrations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setIntegrations(data);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const sidebarItems: { icon: any; tab: Tab; label: string }[] = [
    { icon: Globe, tab: 'overview', label: 'Overview' },
    { icon: Activity, tab: 'activity', label: 'Activity' },
    { icon: Users, tab: 'users', label: 'Users' },
    { icon: Settings, tab: 'settings', label: 'Settings' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-3xl animate-spin" />
          <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Initializing Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/20 rounded-full blur-[100px]" />
      </div>

      {/* Mini Sidebar */}
      <aside className="w-20 bg-slate-900 flex flex-col items-center py-8 gap-6 border-r border-slate-800">
        {/* Logo */}
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-2">
          <Zap className="w-6 h-6 fill-white" />
        </div>

        {/* Nav Icons */}
        <div className="flex flex-col gap-3 flex-1">
          {sidebarItems.map(({ icon: Icon, tab, label }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              title={label}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group relative",
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
              )}
            >
              <Icon className="w-5 h-5" />
              {/* Tooltip */}
              <span className="absolute left-14 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {label}
              </span>
              {activeTab === tab && (
                <motion.div
                  layoutId="active-sidebar"
                  className="absolute left-0 w-1 h-6 bg-indigo-400 rounded-r-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Bottom: Avatar + Logout */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-11 h-11 rounded-full border-2 border-slate-700 p-0.5">
            <img src={`https://i.pravatar.cc/100?u=${user?._id}`} className="rounded-full" alt="avatar" />
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all group relative"
          >
            <LogOut className="w-5 h-5" />
            <span className="absolute left-14 bg-red-900 text-white text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <header className="flex items-end justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                <Shield className="w-4 h-4" />
                Root Administration
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                {activeTab === 'overview' && <>Platform <span className="gradient-text">Overview.</span></>}
                {activeTab === 'activity' && <>Control <span className="gradient-text">Center.</span></>}
                {activeTab === 'users' && <>User <span className="gradient-text">Management.</span></>}
                {activeTab === 'settings' && <>System <span className="gradient-text">Settings.</span></>}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-2xl border-slate-200 bg-white shadow-sm relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </Button>
              <Button className="h-11 px-5 rounded-2xl gradient-bg text-white font-bold shadow-lg shadow-indigo-500/20 gap-2">
                <Plus className="w-4 h-4" />
                Add Tenant
              </Button>
            </div>
          </header>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
            >

              {/* ── OVERVIEW TAB ── */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Users', value: stats.usersCount, icon: Users, color: 'indigo', trend: '+12.5%' },
                      { label: 'Active Chats', value: stats.conversationCount, icon: MessageSquare, color: 'purple', trend: '+24.2%' },
                      { label: 'Live Sessions', value: stats.activeSessions, icon: Activity, color: 'green', trend: '+3' },
                      { label: 'Revenue (MTD)', value: stats.revenue, icon: TrendingUp, color: 'amber', trend: '+8.1%' },
                    ].map((s) => (
                      <Card key={s.label} className="glass-card overflow-hidden group">
                        <CardContent className="pt-6 relative">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                              <h3 className="text-3xl font-black text-slate-900 mt-1">{s.value}</h3>
                            </div>
                            <div className={cn("p-3 rounded-2xl", `bg-${s.color}-50 text-${s.color}-600`)}>
                              <s.icon className="w-6 h-6" />
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                              {s.trend}
                            </span>
                            <span className="text-[10px] text-slate-400">vs last 30 days</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Integrations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shopify */}
                    <Card className="glass-card">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl border bg-green-50 text-green-600 border-green-100">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-slate-800">Shopify</span>
                          </div>
                          <button
                            onClick={() => toggleIntegration('shopify')}
                            className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                              integrations?.shopifyEnabled ? "bg-green-500" : "bg-slate-200"
                            )}
                          >
                            <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", integrations?.shopifyEnabled ? "translate-x-6" : "translate-x-1")} />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">Sync orders, products, and customer sales data.</p>
                        <div className={cn("mt-3 inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter border",
                          integrations?.shopifyEnabled ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-50 text-slate-400 border-slate-100"
                        )}>
                          {integrations?.shopifyEnabled ? "Connected" : "Offline"}
                        </div>
                      </CardContent>
                    </Card>

                    {/* CRM */}
                    <Card className="glass-card">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl border bg-blue-50 text-blue-600 border-blue-100">
                              <Database className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-slate-800">CRM (Nova)</span>
                          </div>
                          <button
                            onClick={() => toggleIntegration('crm')}
                            className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                              integrations?.crmEnabled ? "bg-blue-500" : "bg-slate-200"
                            )}
                          >
                            <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", integrations?.crmEnabled ? "translate-x-6" : "translate-x-1")} />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">Manage leads, pipeline, and customer interactions.</p>
                        <div className={cn("mt-3 inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter border",
                          integrations?.crmEnabled ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-slate-50 text-slate-400 border-slate-100"
                        )}>
                          {integrations?.crmEnabled ? "Connected" : "Offline"}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Namespace Card */}
                  <Card className="gradient-bg text-white border-none shadow-2xl shadow-indigo-500/30 relative overflow-hidden rounded-3xl">
                    <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-white/5 rounded-full blur-[60px]" />
                    <CardContent className="pt-8 pb-8 flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-white/50 mb-1">Active Namespace</p>
                        <code className="text-sm font-mono text-indigo-100">{user?.projectId || 'ID_LOAD_ERROR'}</code>
                        <p className="text-white/70 text-sm mt-2 font-medium">Strict data isolation active across all nodes.</p>
                      </div>
                      <Button className="h-12 px-6 bg-white text-indigo-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 rounded-2xl">
                        Security Audit
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ── ACTIVITY TAB ── */}
              {activeTab === 'activity' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="lg:col-span-2 glass-panel border-none shadow-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                          <Activity className="w-5 h-5 text-indigo-600" />
                        </div>
                        Infrastructure Logs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 pt-4">
                        {[
                          { user: 'System', action: 'Syncing Shopify Orders', time: 'Just now', type: 'info' },
                          { user: 'Admin', action: 'Modified AI Access Policy', time: '12 mins ago', type: 'secure' },
                          { user: 'Member', action: 'Created new instance: Sales_GPT', time: '45 mins ago', type: 'user' },
                          { user: 'System', action: 'Database backup completed', time: '2 hrs ago', type: 'info' },
                          { user: 'Admin', action: 'New tenant onboarded: TechCorp', time: '3 hrs ago', type: 'secure' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm",
                                item.type === 'info' ? "bg-blue-50 text-blue-600" :
                                item.type === 'secure' ? "bg-indigo-50 text-indigo-600" : "bg-purple-50 text-purple-600"
                              )}>
                                {item.user[0]}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{item.action}</p>
                                <p className="text-xs text-slate-400 font-medium">Initiated by {item.user} • {item.time}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="gradient-bg text-white border-none shadow-2xl shadow-indigo-500/40 relative overflow-hidden rounded-[2rem]">
                    <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-white/10 rounded-full blur-[60px]" />
                    <CardHeader className="pt-10">
                      <CardTitle className="text-2xl font-black">Workspace<br/>Multi-Tenancy</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-white/80 text-sm leading-relaxed font-medium">
                        Your platform is enforcing strict data isolation between all organization nodes.
                      </p>
                      <div className="p-4 bg-black/20 rounded-2xl border border-white/10">
                        <p className="text-[10px] uppercase font-black tracking-widest text-white/50 mb-2">Active Namespace</p>
                        <code className="text-xs font-mono break-all text-indigo-100">{user?.projectId || 'ID_LOAD_ERROR'}</code>
                      </div>
                      <Button className="w-full h-12 bg-white text-indigo-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 rounded-2xl">
                        Security Audit
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ── USERS TAB ── */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500 font-medium">{MOCK_USERS.length} members in this workspace</p>
                    <Button className="h-10 px-5 rounded-2xl gradient-bg text-white font-bold shadow-lg gap-2 text-sm">
                      <Plus className="w-4 h-4" /> Invite Member
                    </Button>
                  </div>
                  <Card className="glass-panel border-none shadow-xl overflow-hidden">
                    <div className="divide-y divide-slate-100">
                      {MOCK_USERS.map((u, i) => (
                        <motion.div
                          key={u.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between p-5 hover:bg-slate-50/80 transition-colors group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm border border-indigo-200">
                              {u.name[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {u.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border",
                              u.role === 'ADMIN'
                                ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                                : "bg-slate-50 text-slate-500 border-slate-200"
                            )}>
                              {u.role}
                            </span>
                            <span className={cn(
                              "flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border",
                              u.status === 'active'
                                ? "bg-green-50 text-green-600 border-green-200"
                                : "bg-red-50 text-red-500 border-red-200"
                            )}>
                              {u.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {u.status}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* ── SETTINGS TAB ── */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Config */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-black">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <Sliders className="w-4 h-4 text-indigo-600" />
                          </div>
                          AI Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'Streaming Responses', enabled: true },
                          { label: 'Conversation History', enabled: true },
                          { label: 'Multi-language Support', enabled: false },
                          { label: 'Sentiment Analysis', enabled: false },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                            <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                            <div className={cn(
                              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer",
                              item.enabled ? "bg-indigo-500" : "bg-slate-200"
                            )}>
                              <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform", item.enabled ? "translate-x-4" : "translate-x-0.5")} />
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Security */}
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg font-black">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-purple-600" />
                          </div>
                          Security Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { label: 'Session Timeout (mins)', value: '30' },
                          { label: 'Max Login Attempts', value: '5' },
                          { label: 'API Rate Limit (req/min)', value: '100' },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                            <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                            <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">{item.value}</span>
                          </div>
                        ))}
                        <Button className="w-full mt-2 h-10 rounded-xl bg-slate-900 text-white font-bold text-sm gap-2 hover:bg-slate-800">
                          <RefreshCw className="w-4 h-4" /> Reset All Sessions
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Danger Zone */}
                  <Card className="border-red-200 bg-red-50/30">
                    <CardHeader>
                      <CardTitle className="text-red-600 flex items-center gap-2 text-base font-black">
                        <XCircle className="w-5 h-5" /> Danger Zone
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Sign out all active sessions</p>
                        <p className="text-xs text-slate-500 mt-0.5">This will immediately log out all users across all devices.</p>
                      </div>
                      <Button
                        onClick={handleLogout}
                        className="h-10 px-5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl gap-2 text-sm shadow-lg shadow-red-500/20"
                      >
                        <LogOut className="w-4 h-4" /> Logout All
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
