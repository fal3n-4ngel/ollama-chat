"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquarePlus,
  Copy,
  Send,
  Loader2,
  User,
  Bot,
  Settings,
  ChevronDown,
} from "lucide-react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  saved?: boolean;
  feedback?: "positive" | "negative";
  isTyping?: boolean;
}

interface Chat {
  id: string;
  title: string;
  model: string;
  timestamp: Date;
  messages: Message[];
  useMemory: boolean;
}

interface ModelOption {
  id: string;
  name: string;
  description: string;
}

const MODELS: ModelOption[] = [
  { id: "llava", name: "Llava", description: "Multimodal model for vision and language" },
  { id: "codellama", name: "Code Llama", description: "Specialized for code generation" },
];

const Avatar = ({ role }: { role: "user" | "assistant" }) => {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
      role === "user" ? "bg-blue-500" : "bg-zinc-700"
    }`}>
      {role === "user" ? (
        <User className="w-5 h-5 text-white" />
      ) : (
        <img src="ollama.png" className="w-8 h-8 text-white rounded-full" />
      )}
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex items-center gap-4">
    <Avatar role="assistant" />
    <div className="flex space-x-2 p-3 bg-zinc-100 rounded-xl w-20">
      <div
        className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <div
        className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  </div>
);

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const highlightedCode = hljs.highlight(code, { language }).value;
  
  return (
    <div className="relative group">
      <pre className="rounded-xl bg-zinc-900 p-6 my-4">
        <code
          className={`language-${language} text-sm`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 p-2 bg-zinc-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <Copy className={`w-4 h-4 ${copied ? "text-green-400" : "text-zinc-400"}`} />
      </button>
    </div>
  );
};

const formatMessage = (content: string) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts: Array<{ type: "text" | "code"; content: string; language?: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }

    parts.push({
      type: "code",
      language: match[1] || "plaintext",
      content: match[2].trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      content: content.slice(lastIndex),
    });
  }

  return parts;
};

const AnimatedText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return <span>{displayText}</span>;
};

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";
  
  return (
    <div className={`flex items-start gap-4 mb-6 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar role={message.role} />
      <div className={`flex-1 max-w-3xl ${isUser ? "text-right" : "text-left"}`}>
        <div
          className={`inline-block rounded-xl px-4 py-3 ${
            isUser
              ? "bg-blue-500 text-white"
              : "bg-zinc-100 text-zinc-700"
          }`}
        >
          {formatMessage(message.content).map((part, i) =>
            part.type === "text" ? (
              <AnimatedText key={i} text={part.content} />
            ) : (
              <CodeBlock
                key={i}
                code={part.content}
                language={part.language || "python"}
              />
            )
          )}
        </div>
        <div className={`text-xs text-zinc-400 mt-1 ${isUser ? "text-right" : "text-left"}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

const ModelSelector = ({
  currentModel,
  onModelChange,
}: {
  currentModel: string;
  onModelChange: (model: string) => void;
}) => {
  const selectedModel = MODELS.find((m) => m.id === currentModel) || MODELS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-100">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-medium">{selectedModel.name}</span>
        </div>
        <ChevronDown className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {MODELS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className="flex flex-col items-start py-2"
          >
            <div className="font-medium">{model.name}</div>
            <div className="text-xs text-zinc-500">{model.description}</div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function loadChatsFromStorage(): Chat[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const savedChats = localStorage.getItem("chats");
    return savedChats ? JSON.parse(savedChats) : [];
  } catch (error) {
    console.error("Error loading chats from localStorage:", error);
    return [];
  }
}

function saveChatsToStorage(chats: Chat[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem("chats", JSON.stringify(chats));
  } catch (error) {
    console.error("Error saving chats to localStorage:", error);
  }
}

export default function ClaudeChatInterface() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string>("");
  const [input, setInput] = useState("");
  const [model, setModel] = useState("llava");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChats(loadChatsFromStorage());
  }, []);

  useEffect(() => {
    saveChatsToStorage(chats);
  }, [chats]);

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  useEffect(() => {
    hljs.highlightAll();
  }, [chats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

 

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New chat",
      model: model,
      timestamp: new Date(),
      messages: [],
      useMemory: true,
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);
  };

  const toggleMemory = (chatId: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, useMemory: !chat.useMemory }
          : chat
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !activeChat) return;

    const currentChat = chats.find((chat) => chat.id === activeChat);
    if (!currentChat) return;

    const newMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    const tempTypingMessage: Message = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isTyping: true,
    };

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage, tempTypingMessage],
          };
        }
        return chat;
      })
    );

    setInput("");
    setIsLoading(true);

    try {
      // Format the conversation history for Ollama
      let prompt = input;
      
      if (currentChat.useMemory && currentChat.messages.length > 0) {
        const context = currentChat.messages
          .slice(-4) // Get last 4 messages
          .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
          .join('\n');
        
        prompt = `${context}\nHuman: ${input}\nAssistant:`;
      }

      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false,
          system: "You are a helpful AI assistant. Be concise and clear in your responses.", // Add system prompt
          options: {
            temperature: 0.7,
            num_predict: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        saved: false,
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === activeChat) {
            const messages = chat.messages.filter((m) => !m.isTyping);
            const updatedMessages = [...messages, assistantMessage];
            if (updatedMessages.length === 2) {
              return {
                ...chat,
                title: input.slice(0, 30) + (input.length > 30 ? "..." : ""),
                messages: updatedMessages,
              };
            }
            return {
              ...chat,
              messages: updatedMessages,
            };
          }
          return chat;
        })
      );
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please make sure Ollama is running and try again.",
        timestamp: new Date(),
        saved: false,
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === activeChat) {
            const messages = chat.messages.filter((m) => !m.isTyping);
            return {
              ...chat,
              messages: [...messages, errorMessage],
            };
          }
          return chat;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  
  const currentChat = chats.find((chat) => chat.id === activeChat);

  return (
    <div className="h-screen flex bg-zinc-50">
      {/* Sidebar */}
      <div className="w-80 border-r border-zinc-200 flex flex-col bg-white">
        <div className="p-4 border-b border-zinc-200">
          <button
            onClick={handleNewChat}
            className="w-full p-3 bg-black text-white rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors duration-200"
          >
            <MessageSquarePlus size={20} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`p-4 cursor-pointer border-b border-zinc-100 transition-colors duration-200 ${
                activeChat === chat.id ? "bg-zinc-100" : "hover:bg-zinc-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium truncate">{chat.title}</div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={chat.useMemory}
                    onCheckedChange={() => toggleMemory(chat.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                {new Date(chat.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="border-b border-zinc-200 px-8 py-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <ModelSelector currentModel={model} onModelChange={setModel} />
          </div>
          {currentChat && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="memory" className="text-sm text-zinc-600">
                  Memory
                </Label>
                <Switch
                  id="memory"
                  checked={currentChat.useMemory}
                  onCheckedChange={() => toggleMemory(currentChat.id)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {currentChat?.messages.map((message, index) => (
            message.isTyping ? (
              <TypingIndicator key={index} />
            ) : (
              <MessageBubble key={index} message={message} />
            )
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-4 border-t border-zinc-200 p-6 bg-white"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !activeChat}
            className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}