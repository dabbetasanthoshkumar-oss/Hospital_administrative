'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
    MessageSquare, 
    X, 
    Send, 
    Sparkles, 
    User, 
    Stethoscope,
    Loader2,
    Maximize2,
    Minimize2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Message {
    id: string
    role: 'user' | 'ai'
    content: string
    timestamp: Date
}

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'ai',
            content: 'Hello! I am your Clinical Copilot. How can I assist you with patient data or hospital procedures today?',
            timestamp: new Date()
        }
    ])
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isOpen])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsLoading(true)

        try {
            const { aiChatAction } = await import('../../app/dashboard/ai-actions')
            const result = await aiChatAction(userMsg.content)
            
            if (result.success) {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'ai',
                    content: result.data.response,
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, aiMsg])
            } else {
                const errorMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'ai',
                    content: `Error: ${result.error}. ${result.hint || ''}`,
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, errorMsg])
            }
        } catch (error) {
            console.error('Chat error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 p-6 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all z-50 jelly group"
            >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20 group-hover:opacity-40" />
                <MessageSquare className="h-6 w-6 relative z-10" />
                <Badge className="absolute -top-1 -right-1 bg-red-500 border-none text-[10px] animate-bounce">AI</Badge>
            </button>
        )
    }

    return (
        <Card className={`fixed bottom-8 right-8 w-[400px] glass-card border-none shadow-2xl z-50 transition-all duration-300 overflow-hidden flex flex-col
            ${isMinimized ? 'h-[72px]' : 'h-[600px]'}
        `}>
            {/* Header */}
            <CardHeader className="p-4 border-b border-white/10 bg-primary/20 flex flex-row items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-xl jelly">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-black text-white italic tracking-tighter uppercase">Clinical <span className="text-primary NOT-italic">Copilot</span></CardTitle>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-blue-100/40 uppercase tracking-widest">Active Intelligence</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-2 hover:bg-white/5 rounded-xl transition-all text-blue-100/40 hover:text-white"
                    >
                        {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                    </button>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-white/5 rounded-xl transition-all text-blue-100/40 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </CardHeader>

            {!isMinimized && (
                <>
                    {/* Messages Area */}
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={scrollRef}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`p-2 rounded-xl h-fit ${msg.role === 'user' ? 'bg-primary/20' : 'bg-white/5 border border-white/10'}`}>
                                        {msg.role === 'user' ? <User className="h-4 w-4 text-primary" /> : <Stethoscope className="h-4 w-4 text-primary" />}
                                    </div>
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed
                                        ${msg.role === 'user' 
                                            ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10 font-medium' 
                                            : 'bg-white/5 text-blue-100/80 rounded-tl-none border border-white/10'}
                                    `}>
                                        {msg.content}
                                        <div className={`text-[9px] mt-2 font-black uppercase tracking-widest ${msg.role === 'user' ? 'text-white/40' : 'text-blue-100/20'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                    <span className="text-xs font-black text-blue-100/20 uppercase tracking-widest animate-pulse">Analyzing...</span>
                                </div>
                            </div>
                        )}
                    </CardContent>

                    {/* Input Area */}
                    <div className="p-4 bg-white/5 border-t border-white/10 shrink-0">
                        <div className="relative group">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about patients, medicines, or schedules..."
                                className="w-full h-14 bg-white/5 border-none rounded-2xl pl-6 pr-14 text-white placeholder:text-blue-100/20 text-sm focus:ring-1 focus:ring-primary/50 outline-none transition-all group-focus-within:bg-white/10"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 jelly shadow-lg shadow-primary/20"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-[9px] text-center mt-3 text-blue-100/20 font-black uppercase tracking-[0.2em]">Powered by Clinical Intelligence Engine</p>
                    </div>
                </>
            )}
        </Card>
    )
}
