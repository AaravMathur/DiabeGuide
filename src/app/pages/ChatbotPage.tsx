import { useState, useEffect, useRef } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Send, Bot, User, Mic, Paperclip, Plus, History, X, Activity } from "lucide-react";
import { api } from "../services/api";
import { toast } from "sonner";

type Message = {
  text: string;
  sender: "user" | "ai";
  timestamp: string;
};

type Session = {
  _id: string;
  title: string;
  updatedAt?: string;
  createdAt?: string;
};

const initialWelcomeMsg: Message = {
  text: "Hello! I'm your AI diabetes assistant. How can I help you today?",
  sender: "ai",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

const quickQuestions = [
  "What should I eat for lunch?",
  "Is my sugar level normal?",
  "Suggest some exercises",
  "How to lower blood sugar?",
];

export function ChatbotPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("new");
  const [messages, setMessages] = useState<Message[]>([initialWelcomeMsg]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<any>(null);
  const [readings, setReadings] = useState<any[]>([]);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const statsData = await api.readings.getStats();
        setStats(statsData);
        
        const readingsData = await api.readings.getAll();
        setReadings(readingsData.readings?.slice(0, 5) || []);
      } catch (err) {
        console.error("Failed to load side panel readings:", err);
      }
    };
    fetchHealthData();
  }, [messages]);

  // 1. Fetch chat sessions list on mount
  const fetchSessions = async (selectFirst = false) => {
    try {
      const data = await api.chatbot.getSessions();
      const list = data.sessions || [];
      setSessions(list);
      
      if (selectFirst && list.length > 0 && !list[0]._id.startsWith("mock-session")) {
        setActiveSessionId(list[0]._id);
      }
    } catch (err: any) {
      console.error("Failed to load chat sessions:", err);
    }
  };

  useEffect(() => {
    fetchSessions(true);
  }, []);

  // 2. Fetch messages when active session changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (activeSessionId === "new") {
        setMessages([initialWelcomeMsg]);
        return;
      }

      try {
        const data = await api.chatbot.getSessionMessages(activeSessionId);
        setMessages(data.messages || [initialWelcomeMsg]);
      } catch (err: any) {
        toast.error("Failed to load conversation history");
        setMessages([initialWelcomeMsg]);
      }
    };
    fetchMessages();
  }, [activeSessionId]);

  const lastScrollHeightRef = useRef(0);
  const typewriterIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 3. Auto scroll to bottom when messages change (smart scroll checking user scroll action)
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer as HTMLElement;
        
        if (scrollHeight !== lastScrollHeightRef.current) {
          const isAtBottom = scrollHeight - scrollTop - clientHeight < 120; // 120px tolerance
          
          // Force scroll if it's the user's new message (to show they sent it)
          const lastMsg = messages[messages.length - 1];
          const isUserMsg = lastMsg && lastMsg.sender === "user";
          
          if (isAtBottom || isUserMsg || isTyping) {
            scrollContainer.scrollTop = scrollHeight;
            const timer = setTimeout(() => {
              scrollContainer.scrollTop = scrollHeight;
            }, 50);
            lastScrollHeightRef.current = scrollHeight;
            return () => clearTimeout(timer);
          }
          lastScrollHeightRef.current = scrollHeight;
        }
      }
    }
  }, [messages, isTyping]);

  // Clean up interval and handles scroll on session change
  useEffect(() => {
    if (typewriterIntervalRef.current) {
      clearInterval(typewriterIntervalRef.current);
      typewriterIntervalRef.current = null;
    }
    
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }
  }, [activeSessionId]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setInputMessage("");

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newUserMessage: Message = {
      text: userText,
      sender: "user",
      timestamp,
    };

    // Optimistically update UI
    setMessages((prev) => [...prev, newUserMessage]);
    setIsTyping(true);

    try {
      const data = await api.chatbot.sendMessage(activeSessionId, userText);
      
      // If we started a new session, update activeSessionId to the actual mongoose ID
      if (activeSessionId === "new") {
        setActiveSessionId(data.sessionId);
      }
      
      // Clear previous running typewriter intervals if any
      if (typewriterIntervalRef.current) {
        clearInterval(typewriterIntervalRef.current);
      }

      setIsTyping(false);
      
      // Append placeholder empty AI message
      setMessages((prev) => [...prev, { text: "", sender: "ai", timestamp: data.aiMessage.timestamp }]);
      
      const fullText = data.aiMessage.text;
      let charIdx = 0;
      const speed = 15; // smooth fast speed
      const stepSize = 4; // print 4 characters at a time for lag-free rendering
      
      typewriterIntervalRef.current = setInterval(() => {
        if (charIdx < fullText.length) {
          const chunk = fullText.slice(0, charIdx + stepSize);
          charIdx += stepSize;
          setMessages((prev) => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                text: chunk
              };
            }
            return updated;
          });
        } else {
          if (typewriterIntervalRef.current) {
            clearInterval(typewriterIntervalRef.current);
            typewriterIntervalRef.current = null;
          }
        }
      }, speed);

      fetchSessions();

      // Dispatch custom event to notify layout of new chatbot response
      window.dispatchEvent(new CustomEvent("chatbot-response-ready", {
        detail: {
          text: data.aiMessage.text,
          title: "Chatbot response is ready to be viewed"
        }
      }));
    } catch (err: any) {
      toast.error(err.message || "Failed to get AI response");
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  const handleNewChat = () => {
    setActiveSessionId("new");
    setMessages([initialWelcomeMsg]);
  };

  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-bold text-gray-900 dark:text-white">{part}</strong>;
      }
      return part;
    });
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("* ") || trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
        const content = trimmed.substring(2);
        return (
          <ul key={lineIdx} className="list-disc pl-5 my-0.5">
            <li className="text-sm leading-relaxed">{parseBoldText(content)}</li>
          </ul>
        );
      }
      return (
        <p key={lineIdx} className={`text-sm leading-relaxed min-h-[1.25rem] ${lineIdx > 0 ? "mt-1.5" : ""}`}>
          {parseBoldText(line)}
        </p>
      );
    });
  };

  return (
    <div className="h-[calc(100vh-150px)] md:h-[calc(100vh-180px)] flex gap-4 md:gap-6">
      {/* Mobile Chat History Drawer Overlay */}
      {isHistoryOpen && (
        <div 
          className="fixed inset-0 z-[100] flex md:hidden"
          onClick={() => setIsHistoryOpen(false)}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Drawer Content */}
          <Card 
            className="relative flex h-full w-64 max-w-[80vw] flex-col p-4 shadow-2xl rounded-none border-y-0 border-l-0 bg-white dark:bg-card border-r border-gray-200 dark:border-border animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-border">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Chat History
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsHistoryOpen(false)}
                className="rounded-full h-8 w-8"
              >
                <X className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </Button>
            </div>
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-2 pr-2">
                <button
                  onClick={() => {
                    handleNewChat();
                    setIsHistoryOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    activeSessionId === "new"
                      ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400"
                      : "border-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <p className="font-semibold text-sm">+ Start New Chat</p>
                </button>
                {sessions.map((chat) => (
                  <button
                    key={chat._id}
                    onClick={() => {
                      setActiveSessionId(chat._id);
                      setIsHistoryOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      activeSessionId === chat._id
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/30"
                        : "border-transparent hover:bg-gray-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <p className="font-medium text-sm text-gray-900 dark:text-foreground truncate">{chat.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : chat.createdAt || "Active"}
                    </p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}

      {/* Mobile/Tablet Glucose Summary Drawer Overlay */}
      {isSummaryOpen && (
        <div 
          className="fixed inset-0 z-[100] flex justify-end xl:hidden"
          onClick={() => setIsSummaryOpen(false)}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Drawer Content */}
          <Card 
            className="relative flex h-full w-80 max-w-[85vw] flex-col p-6 shadow-2xl rounded-none border-y-0 border-r-0 bg-white dark:bg-card border-l border-gray-200 dark:border-border animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200 dark:border-border">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Glucose Summary
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Quick reference for your logs</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSummaryOpen(false)}
                className="rounded-full h-8 w-8"
              >
                <X className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </Button>
            </div>

            {stats ? (
              <div className="space-y-4 mb-6">
                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Current Glucose</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.currentGlucose || 120} <span className="text-xs font-normal text-gray-400">mg/dL</span></p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    stats.currentStatus === "Normal" 
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" 
                      : stats.currentStatus === "Low" 
                      ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" 
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                  }`}>
                    {stats.currentStatus || "Normal"}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-lg">
                    <p className="text-[10px] text-gray-500">Avg Glucose</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{stats.weeklyAverage || 112} <span className="text-[10px] font-normal text-gray-400">mg/dL</span></p>
                  </div>
                  <div className="p-2.5 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-lg">
                    <p className="text-[10px] text-gray-500">In Range Today</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{stats.inRangePercentage || 85}%</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-28 flex items-center justify-center text-xs text-gray-400">
                Loading stats...
              </div>
            )}

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex-1 flex flex-col min-h-0">
              <h4 className="font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Recent Logs</h4>
              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-2.5 pr-2">
                  {readings.length > 0 ? (
                    readings.map((reading, index) => {
                      const val = reading.level ?? reading.value;
                      return (
                        <div key={index} className="p-2.5 bg-gray-50/40 dark:bg-gray-900/20 border border-gray-100/60 dark:border-gray-800/40 rounded-lg flex items-center justify-between text-xs transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/40">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{reading.meal}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{reading.date} • {reading.time}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">{val} <span className="text-[9px] font-normal text-gray-400">mg/dL</span></p>
                            <span className={`text-[9px] font-medium ${
                              val >= 70 && val <= 130 
                                ? "text-emerald-600 dark:text-emerald-400" 
                                : "text-amber-600 dark:text-amber-400"
                            }`}>
                              {val >= 70 && val <= 130 ? "Normal" : "Monitor"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      No readings logged yet.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </Card>
        </div>
      )}

      {/* Chat History Sidebar */}
      <Card className="hidden md:flex w-64 flex-shrink-0 p-4 flex-col min-h-0 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Chat History</h3>
          <Button variant="ghost" size="icon" onClick={handleNewChat} title="New Chat">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-2 pr-2">
            <button
              onClick={handleNewChat}
              className={`w-full text-left p-3 rounded-lg border transition ${
                activeSessionId === "new"
                  ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400"
                  : "border-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-slate-800"
              }`}
            >
              <p className="font-semibold text-sm">+ Start New Chat</p>
            </button>
            {sessions.map((chat) => (
              <button
                key={chat._id}
                onClick={() => setActiveSessionId(chat._id)}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  activeSessionId === chat._id
                    ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/30"
                    : "border-transparent hover:bg-gray-100 dark:hover:bg-slate-800"
                }`}
              >
                <p className="font-medium text-sm text-gray-900 dark:text-foreground truncate">{chat.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : chat.createdAt || "Active"}
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-border flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-foreground text-sm md:text-base leading-none">AI Health Assistant</h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1 leading-none">
                {activeSessionId === "new" ? "New conversation" : "Active chat session"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="md:hidden" onClick={() => setIsHistoryOpen(true)}>
              <History className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">History</span>
            </Button>
            <Button variant="outline" size="sm" className="xl:hidden" onClick={() => setIsSummaryOpen(true)}>
              <Activity className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Summary</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleNewChat}>
              <Plus className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">New</span>
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 min-h-0 p-4 md:p-6" ref={scrollAreaRef}>
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2.5 md:gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                  <AvatarFallback
                    className={
                      message.sender === "ai"
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                        : "bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-foreground"
                    }
                  >
                    {message.sender === "ai" ? <Bot className="w-4 h-4 md:w-5 md:h-5" /> : <User className="w-4 h-4 md:w-5 md:h-5" />}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex-1 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] md:max-w-[80%] w-fit rounded-2xl p-3 md:p-4 ${
                      message.sender === "ai"
                        ? "bg-gray-100 dark:bg-slate-800/60 text-gray-950 dark:text-foreground"
                        : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                    }`}
                  >
                    <div className="space-y-0.5">
                      {renderFormattedText(message.text)}
                    </div>
                    <p
                      className={`text-[10px] mt-2 ${
                        message.sender === "ai" ? "text-gray-500" : "text-blue-100"
                      }`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 md:w-10 md:h-10">
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                    <Bot className="w-4 h-4 md:w-5 md:h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 dark:bg-slate-800/60 rounded-2xl p-4">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="px-4 py-3 md:px-6 md:py-4 border-t border-gray-200 dark:border-border">
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-1.5">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 rounded-full text-xs md:text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 md:p-6 border-t border-gray-200 dark:border-border">
          <div className="flex gap-2 md:gap-3 max-w-3xl mx-auto">
            <Button variant="outline" size="icon" className="flex-shrink-0 hidden sm:flex">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 bg-white dark:bg-slate-900"
            />
            <Button variant="outline" size="icon" className="flex-shrink-0 hidden sm:flex">
              <Mic className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleSendMessage}
              className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              size="icon"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
          <p className="text-[10px] text-gray-500 text-center mt-2">
            AI responses are for informational purposes only. Always consult your healthcare provider.
          </p>
        </div>
      </Card>

      {/* Patient Readings Right Sidebar */}
      <Card className="hidden xl:flex w-72 flex-shrink-0 p-4 flex-col min-h-0 overflow-hidden">
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Glucose Summary</h3>
          <p className="text-xs text-gray-500 mt-0.5">Quick reference for your logs</p>
        </div>

        {stats ? (
          <div className="space-y-4 mb-6">
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Current Glucose</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.currentGlucose || 120} <span className="text-xs font-normal text-gray-400">mg/dL</span></p>
              </div>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                stats.currentStatus === "Normal" 
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" 
                  : stats.currentStatus === "Low" 
                  ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400" 
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
              }`}>
                {stats.currentStatus || "Normal"}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-lg">
                <p className="text-[10px] text-gray-500">Avg Glucose</p>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{stats.weeklyAverage || 112} <span className="text-[10px] font-normal text-gray-400">mg/dL</span></p>
              </div>
              <div className="p-2.5 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-lg">
                <p className="text-[10px] text-gray-500">In Range Today</p>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{stats.inRangePercentage || 85}%</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-28 flex items-center justify-center text-xs text-gray-400">
            Loading stats...
          </div>
        )}

        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex-1 flex flex-col min-h-0">
          <h4 className="font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Recent Logs</h4>
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-2.5 pr-2">
              {readings.length > 0 ? (
                readings.map((reading, index) => {
                  const val = reading.level ?? reading.value;
                  return (
                    <div key={index} className="p-2.5 bg-gray-50/40 dark:bg-gray-900/20 border border-gray-100/60 dark:border-gray-800/40 rounded-lg flex items-center justify-between text-xs transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{reading.meal}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{reading.date} • {reading.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">{val} <span className="text-[9px] font-normal text-gray-400">mg/dL</span></p>
                        <span className={`text-[9px] font-medium ${
                          val >= 70 && val <= 130 
                            ? "text-emerald-600 dark:text-emerald-400" 
                            : "text-amber-600 dark:text-amber-400"
                        }`}>
                          {val >= 70 && val <= 130 ? "Normal" : "Monitor"}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-gray-400 text-xs">
                  No readings logged yet.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
}
