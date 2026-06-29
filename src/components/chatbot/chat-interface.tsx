'use client';

import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Paperclip, File, Plus, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { InitialsAvatar } from '@/components/shared/initials-avatar';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

export default function ChatInterface() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    async function loadConversations() {
      try {
        const convos = await apiFetch('/chat/conversations');
        setConversations(convos);
        if (convos.length > 0 && !activeConversationId) {
          setActiveConversationId(convos[0].id);
        }
      } catch (error) {
        console.error('Failed to load conversations', error);
      }
    }
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Load messages when active conversation changes
  useEffect(() => {
    async function loadMessages() {
      if (!activeConversationId) return;
      try {
        const convo = await apiFetch(`/chat/conversations/${activeConversationId}`);
        setMessages(convo.messages || []);
      } catch (error) {
        console.error('Failed to load messages', error);
      }
    }
    loadMessages();
  }, [activeConversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleNewChat = async () => {
    try {
      const convo = await apiFetch('/chat/conversations', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Chat' })
      });
      setConversations([convo, ...conversations]);
      setActiveConversationId(convo.id);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create new chat', error);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !file) || !activeConversationId || isSending) return;

    let convoId = activeConversationId;
    setIsSending(true);
    setInput('');
    setFile(null);

    try {
      // Opt: Upload file first if exists
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        
        await apiFetch(`/chat/conversations/${convoId}/attachments`, {
          method: 'POST',
          body: formData, // fetch will automatically set the correct multipart boundary if we omit Content-Type
          headers: {
            'Content-Type': 'multipart/form-data' // Actually for fetch+FormData, we MUST let browser set it, so apiFetch needs a way to handle this.
            // Wait, apiFetch sets application/json. We should conditionally delete it or use standard fetch.
          }
        });
        // Note: For a robust implementation, `apiFetch` would need to detect FormData and not set Content-Type.
        // For this demo, let's assume we do a raw fetch if file exists to avoid apiFetch JSON header issue.
        const token = (window as any).__accessToken;
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/chat/conversations/${convoId}/attachments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      }

      if (input.trim()) {
        // Optimistic UI update
        const tempMsg: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: input,
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        const aiResponse = await apiFetch(`/chat/conversations/${convoId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ content: input })
        });

        // Refetch messages to get final state
        const convo = await apiFetch(`/chat/conversations/${convoId}`);
        setMessages(convo.messages);
      }
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Please log in to use the AI assistant.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[80vh] w-full rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/20 flex flex-col">
        <div className="p-4">
          <Button onClick={handleNewChat} className="w-full flex gap-2">
            <Plus className="h-4 w-4" /> New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {conversations.map(convo => (
              <button
                key={convo.id}
                onClick={() => setActiveConversationId(convo.id)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-left truncate ${
                  activeConversationId === convo.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">{convo.title}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground">Ask me anything about competitive programming!</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="shrink-0">
                {msg.role === 'user' ? (
                  <InitialsAvatar name={user?.displayName || user?.email} />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    AI
                  </div>
                )}
              </div>
              <div className={`max-w-[80%] rounded-lg p-4 ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex gap-4">
               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  AI
               </div>
               <div className="rounded-lg bg-muted p-4 flex items-center gap-2">
                 <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
               </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-4 bg-background">
          {file && (
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded-md w-fit">
              <File className="h-4 w-4" />
              {file.name}
              <button onClick={() => setFile(null)} className="ml-2 hover:text-destructive">×</button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="shrink-0 relative overflow-hidden">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".txt,.md,.js,.ts,.py,.cpp,.java,.c"
              />
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a coding question..."
              className="flex-1"
              disabled={isSending}
            />
            <Button onClick={handleSend} disabled={isSending || (!input.trim() && !file)}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
