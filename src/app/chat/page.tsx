"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Send, 
  Plus, 
  MessageSquare, 
  Trash2, 
  LogOut, 
  Layout,
  Settings, 
  ChevronLeft,
  Bot,
  User,
  Loader2,
  Search,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Suspense } from 'react';
import { TypingMessage } from '@/components/TypingMessage';

function ChatContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectIdParam = searchParams.get('projectId');
  
  const [user, setUser] = useState<any>(null);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [selectedProductInstanceId, setSelectedProductInstanceId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch User
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const effectiveProjectId = projectIdParam || user?.projectId;

  // Fetch Product Instances
  const { data: productInstances = [] } = useQuery({
    queryKey: ['productInstances', effectiveProjectId],
    queryFn: async () => {
      if (!effectiveProjectId) return [];
      const res = await fetch(`/api/product-instances?projectId=${effectiveProjectId}`);
      return res.json();
    },
    enabled: !!effectiveProjectId,
  });

  // Set initial product instance
  useEffect(() => {
    if (productInstances.length > 0 && !selectedProductInstanceId) {
      setSelectedProductInstanceId(productInstances[0]._id);
    }
  }, [productInstances]);

  // Fetch Conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', effectiveProjectId, selectedProductInstanceId],
    queryFn: async () => {
      if (!effectiveProjectId) return [];
      let url = `/api/conversations?projectId=${effectiveProjectId}`;
      if (selectedProductInstanceId) url += `&productInstanceId=${selectedProductInstanceId}`;
      const res = await fetch(url);
      return res.json();
    },
    enabled: !!effectiveProjectId,
  });

  // Set initial conversation
  useEffect(() => {
    if (conversations.length > 0 && !currentConvId) {
      // Don't auto-set if we just deleted one or if we switched product
      // Actually, auto-setting the first one is good for UX
      setCurrentConvId(conversations[0]._id);
    }
  }, [conversations, selectedProductInstanceId]);

  // Fetch Messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', currentConvId],
    queryFn: async () => {
      if (!currentConvId) return [];
      const res = await fetch(`/api/messages?conversationId=${currentConvId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    },
    enabled: !!currentConvId,
  });

  useEffect(scrollToBottom, [messages]);

  const handleNewChat = async () => {
    if (!user || !selectedProductInstanceId) return;
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        projectId: user.projectId, 
        productInstanceId: selectedProductInstanceId, 
        title: 'New Chat' 
      }),
    });
    const newConv = await res.json();
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    setCurrentConvId(newConv._id);
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        if (currentConvId === id) {
          setCurrentConvId(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    } catch (err) {
      console.error('Failed to rename conversation', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    let targetConvId = currentConvId;
    
    // Auto-create conversation if none selected
    if (!targetConvId) {
      if (!user || !selectedProductInstanceId) return;
      try {
        setLoading(true);
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            projectId: user.projectId, 
            productInstanceId: selectedProductInstanceId,
            title: input.slice(0, 30) + (input.length > 30 ? '...' : '')
          }),
        });
        const newConv = await res.json();
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        setCurrentConvId(newConv._id);
        targetConvId = newConv._id;
      } catch (err) {
        console.error('Failed to create conversation', err);
        setLoading(false);
        return;
      }
    }

    const userMsg = { role: 'user', content: input, createdAt: new Date() };
    
    // Optimistic update
    queryClient.setQueryData(['messages', targetConvId], (old: any) => [...(old || []), userMsg]);
    
    const messageToSend = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: targetConvId, content: messageToSend }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      // Check if it's a stream
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('text/event-stream')) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let aiFullContent = "";
        
        // Add a placeholder message for streaming
        queryClient.setQueryData(['messages', targetConvId], (old: any) => [
          ...(old || []), 
          { role: 'assistant', content: '', createdAt: new Date(), isStreaming: true }
        ]);

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.replace('data: ', '').trim();
                if (dataStr === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.content) {
                    aiFullContent += parsed.content;
                    // Update the streaming message in real-time
                    queryClient.setQueryData(['messages', targetConvId], (old: any) => {
                      const updated = [...(old || [])];
                      const lastMsg = updated[updated.length - 1];
                      if (lastMsg && lastMsg.isStreaming) {
                        lastMsg.content = aiFullContent;
                      }
                      return updated;
                    });
                  }
                } catch (err) {
                  // Ignore JSON parse errors for malformed chunks
                }
              }
            }
          }
          // Mark streaming as done
          queryClient.setQueryData(['messages', targetConvId], (old: any) => {
            const updated = [...(old || [])];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg) lastMsg.isStreaming = false;
            return updated;
          });
          queryClient.invalidateQueries({ queryKey: ['messages', targetConvId] });
        }
      } else {
        // Fallback for non-streaming response
        queryClient.invalidateQueries({ queryKey: ['messages', targetConvId] });
      }
    } catch (err: any) {
      console.error(err);
      queryClient.setQueryData(['messages', targetConvId], (old: any) => [
        ...(old || []), 
        { role: 'assistant', content: `Error: ${err.message}`, createdAt: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = (conversations || []).filter((c: any) => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[100dvh] bg-white overflow-hidden font-sans relative">
      {/* Sidebar - Responsive handling */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <>
            {/* Mobile Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside 
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed md:relative inset-y-0 left-0 w-[280px] md:w-80 bg-slate-900 flex flex-col z-50 h-full"
            >
              <div className="p-4 md:p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-black text-white text-xl tracking-tight">Debales <span className="text-indigo-400">AI</span></span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/10 rounded-xl">
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                </div>

            <div className="px-4 space-y-4 mb-6">
              {/* Product Instance Selector */}
              <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                {productInstances.map((pi: any) => (
                  <button
                    key={pi._id}
                    onClick={() => {
                      setSelectedProductInstanceId(pi._id);
                      setCurrentConvId(null); // Reset conv when switching product
                    }}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                      selectedProductInstanceId === pi._id 
                        ? "bg-indigo-600 text-white shadow-sm" 
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    )}
                  >
                    {pi.name}
                  </button>
                ))}
              </div>

              <Button 
                onClick={handleNewChat}
                className="w-full h-12 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl flex items-center justify-start gap-3 px-4 transition-all duration-200 group"
              >
                <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-sm">New Discussion</span>
              </Button>

              <div className="relative group">
                <Input 
                  placeholder="Search chats..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border-white/10 text-white pl-10 h-10 rounded-xl focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 group-focus-within:text-indigo-400" />
              </div>
            </div>

            <ScrollArea className="flex-1 px-4">
              <div className="space-y-2 pb-6">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 mb-2">Recent Chats</p>
                {filteredConversations.map((conv: any) => (
                  <div key={conv._id} className="group relative">
                    <button
                      onClick={() => {
                        if (editingId === conv._id) return;
                        setCurrentConvId(conv._id);
                      }}
                      className={cn(
                        "w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200 relative overflow-hidden pr-10",
                        currentConvId === conv._id 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      )}
                    >
                      <MessageSquare className={cn("w-4 h-4 shrink-0", currentConvId === conv._id ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
                      {editingId === conv._id ? (
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => {
                            handleRenameConversation(conv._id, editTitle);
                            setEditingId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleRenameConversation(conv._id, editTitle);
                              setEditingId(null);
                            }
                          }}
                          className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full p-0"
                        />
                      ) : (
                        <span className="text-sm font-medium truncate text-left">{conv.title}</span>
                      )}
                      {currentConvId === conv._id && !editingId && (
                        <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                      )}
                    </button>
                    
                    <div className="absolute right-2 top-2 h-8 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(conv._id);
                          setEditTitle(conv.title);
                        }}
                        className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/10 rounded-md"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteConversation(e, conv._id)}
                        className="h-7 w-7 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 font-bold border border-white/10">
                  {user?.name?.[0] || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 truncate uppercase tracking-tighter">{user?.role} ACCOUNT</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 h-8 w-8">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-white min-w-0">
        {!sidebarOpen && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 md:top-6 left-4 md:left-6 z-30 shadow-md border-slate-200 rounded-xl bg-white hover:bg-slate-50"
          >
            <Layout className="w-5 h-5 text-slate-600" />
          </Button>
        )}

        {/* Header */}
        <header className="h-16 md:h-20 border-b border-slate-100 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 min-w-0">
            {!sidebarOpen && <div className="w-10 md:w-12 shrink-0" />} 
            <h2 className="text-base md:text-xl font-extrabold text-slate-900 tracking-tight truncate">
              {conversations.find((c: any) => c._id === currentConvId)?.title || "AI Assistant"}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <Button variant="outline" size="sm" className="hidden sm:flex rounded-xl font-bold border-slate-200 text-slate-600 gap-2">
              <Settings className="w-4 h-4" />
              Options
            </Button>
            <div className="h-6 md:h-8 w-[1px] bg-slate-100 mx-1 md:mx-2" />
            <div className="flex -space-x-2">
              {[1, 2].map(i => (
                <div key={i} className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {messagesLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className={cn("flex items-start gap-4", i % 2 === 0 ? "flex-row-reverse" : "")}>
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 animate-pulse shrink-0" />
                    <div className="space-y-2 w-full max-w-[60%]">
                      <div className="skeleton-box w-full" />
                      <div className="skeleton-box w-[70%]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 px-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-50 rounded-3xl flex items-center justify-center animate-float">
                  <Bot className="w-8 h-8 md:w-10 md:h-10 text-indigo-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">How can I help you today?</h3>
                  <p className="text-sm md:text-base text-slate-500 max-w-sm mx-auto">
                    Ask me about your Shopify orders, CRM pipeline, or general business strategy.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {["Show my Shopify orders", "Check CRM leads", "Sales revenue report", "Customer list"].map(q => (
                    <Button 
                      key={q} 
                      variant="outline" 
                      onClick={() => {
                        setInput(q);
                        setTimeout(() => {
                          const form = document.querySelector('form');
                          form?.requestSubmit();
                        }, 0);
                      }}
                      className="rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-indigo-300 transition-all font-semibold py-6 text-xs md:text-sm"
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
            
            {messages.map((msg: any, i: number) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i} 
                className={cn(
                  "flex items-start gap-4",
                  msg.role === 'user' ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-110",
                  msg.role === 'user' 
                    ? "bg-slate-100 text-slate-600" 
                    : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                )}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
                </div>
                <div className={cn(
                  "max-w-[80%] space-y-2",
                  msg.role === 'user' ? "text-right" : "text-left"
                )}>
                  <div className={msg.role === 'user' ? "chat-bubble-user" : "chat-bubble-assistant group relative"}>
                    {msg.role === 'assistant' && !msg.isStreaming && (new Date().getTime() - new Date(msg.createdAt).getTime() < 10000) ? (
                      <TypingMessage text={msg.content} />
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}
                    {msg.role === 'assistant' && !msg.isStreaming && (
                      <button 
                        onClick={() => navigator.clipboard.writeText(msg.content)}
                        className="absolute -right-10 top-0 p-2 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-1">
                    {msg.role === 'user' ? 'You' : 'Debales AI'} • {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </p>
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="chat-bubble-assistant flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            {loading && !messages.some((m: any) => m.isStreaming) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-slate-400"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Debales AI is typing...</span>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 md:p-8 pt-0 bg-white">
          <div className="max-w-4xl mx-auto relative group">
            <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
              <div className="relative flex-1">
                <Input 
                  placeholder="Ask me anything..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="h-14 md:h-16 pl-6 pr-16 md:pr-20 rounded-3xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm md:text-base shadow-sm group-hover:shadow-md border-2"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="h-12 w-12 md:h-14 md:w-14 rounded-full gradient-bg text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all duration-200 shrink-0"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </form>
            <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest hidden md:block">
              Built with precision for enterprise performance
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
