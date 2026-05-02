"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/chat');
        }
      } else {
        alert('Invalid credentials');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-200/40 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-200/40 rounded-full blur-[120px] animate-pulse" />
      
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-6 relative z-10">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:block space-y-8"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Next Generation AI Workspace</span>
            </div>
            <h1 className="text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
              Manage Your <span className="gradient-text">AI Ecosystem</span> with Precision.
            </h1>
            <p className="text-xl text-slate-500 max-w-md leading-relaxed">
              The ultimate multi-tenant platform for organizations to build, deploy, and scale their custom AI assistants.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: ShieldCheck, title: "Secure Isolation", desc: "Enterprise-grade multi-tenancy" },
              { icon: Zap, title: "Gemini Powered", desc: "State-of-the-art AI integration" }
            ].map((feature, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/50 border border-white shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-snug">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="glass-panel border-white/40 overflow-hidden rounded-3xl">
            <CardHeader className="space-y-2 pt-10 pb-6 text-center">
              <div className="flex justify-center lg:hidden mb-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl glow-primary">
                  <Zap className="w-8 h-8 fill-white" />
                </div>
              </div>
              <CardTitle className="text-4xl font-extrabold tracking-tight text-slate-900">Welcome Back</CardTitle>
              <CardDescription className="text-base text-slate-500">
                Log in to access your secure AI environment
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-6 px-10">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Work Email</label>
                  <Input 
                    type="email" 
                    placeholder="name@company.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    className="h-14 rounded-2xl border-slate-200 bg-white/80 focus:ring-purple-500 focus:border-purple-500 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-sm font-bold text-slate-700">Password</label>
                    <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Forgot?</a>
                  </div>
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    className="h-14 rounded-2xl border-slate-200 bg-white/80 focus:ring-purple-500 focus:border-purple-500 text-base"
                  />
                </div>
              </CardContent>
              <CardFooter className="px-10 pb-10 pt-6">
                <Button 
                  className="w-full h-14 rounded-2xl text-lg font-bold gradient-bg text-white shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? "Initializing..." : "Launch Workspace"}
                </Button>
              </CardFooter>
            </form>
          </Card>
          <p className="text-center mt-8 text-slate-400 text-sm">
            Don't have an account? <span className="text-indigo-600 font-bold cursor-pointer">Contact Administration</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
