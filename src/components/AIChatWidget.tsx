import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Sparkles, X } from 'lucide-react'
import { api } from '../lib/api'
import { Button } from './ui/button'

interface Message {
    id: string
    role: 'user' | 'ai'
    content: string
    timestamp: Date
}

interface AIChatWidgetProps {
    meetingId: string
    isOpen: boolean
    onClose: () => void
}

export function AIChatWidget({ meetingId, isOpen, onClose }: AIChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'ai',
            content: 'Hi! I can answer questions about this meeting. Try asking "What was the budget?" or "What are the next steps?"',
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isOpen])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const res = await api('/chat/ask', {
                method: 'POST',
                body: JSON.stringify({ meetingId, question: userMessage.content })
            })

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: res.data.answer || "I'm sorry, I couldn't process that.",
                timestamp: new Date()
            }

            setMessages(prev => [...prev, aiMessage])
        } catch (err) {
            console.error("Chat error", err)
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'ai',
                content: "Sorry, I encountered an error. Please try again.",
                timestamp: new Date()
            }])
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-xl">
                <div className="flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5" />
                    <h3 className="font-semibold">Meeting Assistant</h3>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''
                            }`}
                    >
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'ai' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-600'
                            }`}>
                            {msg.role === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </div>
                        <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === 'user'
                            ? 'bg-purple-600 text-white rounded-tr-none'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg rounded-tl-none p-3 shadow-sm">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-white rounded-b-xl">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSend()
                    }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about this meeting..."
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className="bg-purple-600 hover:bg-purple-700 shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
