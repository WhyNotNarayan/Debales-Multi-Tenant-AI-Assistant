"use client";

import { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  ShoppingBag, 
  Database, 
  TrendingUp, 
  Activity,
  CheckCircle2,
  XCircle,
  Settings,
  ChevronRight,
  Shield,
  Zap,
  Globe,
  Bell,
  Plus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [integrations, setIntegrations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    usersCount: 124,
    conversationCount: 842,
    activeSessions: 12
  });

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) throw new Error('Auth failed');
        const userData = await userRes.json();
        setUser(userData);
        
        await Promise.all([
          fetchConfig(userData.projectId),
          fetchIntegrations(userData.projectId)
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchConfig = async (pId: string) => {
    const res = await fetch(`/api/dashboard/config?projectId=${pId}`);
    const data = await res.json();
    setConfig(data);
  };

  const fetchIntegrations = async (pId: string) => {
    const res = await fetch(`/api/integrations?projectId=${pId}`);
    const data = await res.json();
    setIntegrations(data);
  };

  const toggleIntegration = async (type: 'shopify' | 'crm') => {
    if (!user) return;
    const payload = {
      projectId: user.projectId,
      shopifyEnabled: type === 'shopify' ? !integrations.shopifyEnabled : integrations.shopifyEnabled,
      crmEnabled: type === 'crm' ? !integrations.crmEnabled : integrations.crmEnabled,
    };

    const res = await fetch('/api/integrations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setIntegrations(data);
  };

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'usersCount':
        return (
          <Card key={widgetId} className="glass-card overflow-hidden group">
            <CardContent className="pt-6 relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="w-24 h-24 text-indigo-600" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Users</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.usersCount}</h3>
                </div>
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-inner">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5%
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-tight">vs last 30 days</span>
              </div>
            </CardContent>
          </Card>
        );
      case 'conversationCount':
        return (
          <Card key={widgetId} className="glass-card overflow-hidden group">
            <CardContent className="pt-6 relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <MessageSquare className="w-24 h-24 text-purple-600" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Chats</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.conversationCount}</h3>
                </div>
                <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 shadow-inner">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +24.2%
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-tight">vs last 30 days</span>
              </div>
            </CardContent>
          </Card>
        );
      case 'shopifyStatus':
        return (
          <Card key={widgetId} className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-50 rounded-xl text-green-600 border border-green-100">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-800">Shopify</span>
                </div>
                <button 
                  onClick={() => toggleIntegration('shopify')}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                    integrations?.shopifyEnabled ? "bg-green-500" : "bg-slate-200"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    integrations?.shopifyEnabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">Sync orders, products, and customer sales data.</p>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter border",
                  integrations?.shopifyEnabled ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-50 text-slate-400 border-slate-100"
                )}>
                  {integrations?.shopifyEnabled ? "System Connected" : "Connection Offline"}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 'crmStatus':
        return (
          <Card key={widgetId} className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
                    <Database className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-800">CRM (Nova)</span>
                </div>
                <button 
                  onClick={() => toggleIntegration('crm')}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                    integrations?.crmEnabled ? "bg-blue-500" : "bg-slate-200"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    integrations?.crmEnabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">Manage leads, pipeline, and customer interactions.</p>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter border",
                  integrations?.crmEnabled ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-slate-50 text-slate-400 border-slate-100"
                )}>
                  {integrations?.crmEnabled ? "API Active" : "Waiting for Setup"}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-3xl animate-spin glow-primary" />
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
      <aside className="w-20 bg-slate-900 flex flex-col items-center py-8 gap-8 border-r border-slate-800">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
          <Zap className="w-6 h-6 fill-white" />
        </div>
        <div className="flex flex-col gap-6 flex-1">
          {[Globe, Activity, Users, Settings].map((Icon, i) => (
            <div key={i} className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer group",
              i === 1 ? "bg-white/10 text-white" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
            )}>
              <Icon className="w-6 h-6" />
            </div>
          ))}
        </div>
        <div className="w-12 h-12 rounded-full border-2 border-slate-700 p-0.5">
          <img src={`https://i.pravatar.cc/100?u=${user?._id}`} className="rounded-full" alt="avatar" />
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <header className="flex items-end justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                <Shield className="w-4 h-4" />
                Root Administration
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight">Control <span className="gradient-text">Center.</span></h1>
              <p className="text-slate-500 text-lg max-w-xl font-medium">
                Managing workspace <span className="text-slate-900 font-bold">Acme Sales</span> • Status: <span className="text-green-600">Enterprise Active</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-200 bg-white shadow-sm relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </Button>
              <Button className="h-12 px-6 rounded-2xl gradient-bg text-white font-bold shadow-xl shadow-indigo-500/20 gap-2">
                <Plus className="w-5 h-5" />
                Add Tenant
              </Button>
            </div>
          </header>

          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {config?.sections?.map((section: any, idx: number) => (
                <div key={idx} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">{section.title}</h2>
                    <div className="h-[1px] flex-1 bg-slate-200/60" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {section.widgets?.map((widgetId: string) => renderWidget(widgetId))}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-4">
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
                <div className="space-y-4 pt-4">
                  {[
                    { user: 'System', action: 'Syncing Shopify Orders', time: 'Just now', type: 'info' },
                    { user: 'Admin', action: 'Modified AI Access Policy', time: '12 mins ago', type: 'secure' },
                    { user: 'Member', action: 'Created new instance: Sales_GPT', time: '45 mins ago', type: 'user' },
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
                          <p className="text-xs text-slate-400 font-medium tracking-tight">Initiated by {item.user} • {item.time}</p>
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
                <CardTitle className="text-2xl font-black">Workspace Multi-Tenancy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-white/80 text-sm leading-relaxed font-medium">
                  Your platform is currently enforcing strict data isolation between all organization nodes. 
                </p>
                <div className="p-5 bg-black/20 rounded-2xl border border-white/10 backdrop-blur-md">
                  <p className="text-[10px] uppercase font-black tracking-widest text-white/50 mb-2">Active Namespace</p>
                  <code className="text-xs font-mono break-all text-indigo-100">
                    {user?.projectId || 'ID_LOAD_ERROR'}
                  </code>
                </div>
                <Button className="w-full h-14 bg-white text-indigo-600 font-black text-sm uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">
                  Security Audit
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
