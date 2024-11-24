/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquarePlus,
  Save,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Send,
  Download,
  Loader2,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import ModelSelector from "@/components/ModelSelector";

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
}

// Typing animation component
const TypingIndicator = () => (
  <div className="flex space-x-2 p-4 bg-zinc-100 rounded-xl w-24">
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
);

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const highlightedCode = hljs.highlight(code, { language }).value;
  return (
    <pre className="rounded-xl bg-zinc-900 p-6 my-4">
      <code
        className={`language-${language} text-sm`}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </pre>
  );
};

const formatMessage = (content: string) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

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

// Animated text reveal component
const AnimatedText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 0); // Adjust speed as needed
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return <span>{displayText}</span>;
};

export default function ClaudeChatInterface() {
  const [chats, setChats] = useState<Chat[]>(() => {
    const savedChats = localStorage.getItem("chats");
    return savedChats ? JSON.parse(savedChats) : [];
  });
  const [activeChat, setActiveChat] = useState<string>("");
  const [input, setInput] = useState("");
  const [model, setModel] = useState("llava");
  const [showFeedbackAlert, setShowFeedbackAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  useEffect(() => {
    hljs.highlightAll();
  }, [chats]);

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New chat",
      model: model,
      timestamp: new Date(),
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    // Add temporary typing indicator
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
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model,
          prompt: input,
          stream: false,
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
        content:
          "Sorry, I encountered an error. Please make sure Ollama is running and try again.",
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
        <button
          onClick={handleNewChat}
          className="mx-6 my-6 p-3 bg-black text-white rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors duration-200"
        >
          <MessageSquarePlus size={20} />
          New Chat
        </button>

        <div className="flex-1 overflow-y-auto px-3">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`p-4 my-1 cursor-pointer rounded-xl transition-colors duration-200 ${
                activeChat === chat.id ? "bg-zinc-100" : "hover:bg-zinc-50"
              }`}
            >
              <div className="text-sm font-medium truncate">{chat.title}</div>
              <div className="text-xs text-zinc-500 mt-1">
                {new Date(chat.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-200 p-6">
          <ModelSelector currentModel={model} onModelChange={setModel} />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="border-b border-zinc-200 px-8 py-6 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            {currentChat?.title || "Select or create a new chat"}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {currentChat?.messages.map((message, index) => (
            <div key={index} className="mb-4">
              {message.role === "assistant" && message.isTyping ? (
                <TypingIndicator />
              ) : (
                <div
                  className={`${
                    message.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-4 rounded-xl ${
                      message.role === "user"
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
                          language={part.language||"Python"}
                        />
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center border-t border-zinc-200 p-6 bg-white"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
          />
          <button
            type="submit"
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
