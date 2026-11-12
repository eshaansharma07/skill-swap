"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { useAuth, User } from "@/lib/auth-context";
import { formatTime, getInitials } from "@/lib/utils";
import {
  Send,
  MessageSquare,
  Search,
  Check,
  CheckCheck,
  Video,
  Repeat,
  ArrowLeft,
  Circle,
} from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

interface Conversation {
  id: string;
  participantIds: string[];
  otherUser?: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  lastMessageAt?: string;
  lastMessageContent?: string;
  lastMessageSenderId?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  readAt?: string;
  createdAt: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Fetch conversations
  const loadConversations = () => {
    apiFetch<Conversation[]>("/api/conversations")
      .then((data) => {
        setConversations(data);
        if (data.length > 0 && !activeConvId) {
          setActiveConvId(data[0].id);
        }
      })
      .catch(() => setConversations([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // 2. Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;

    apiFetch<Message[]>(`/api/conversations/${activeConvId}/messages`)
      .then((data) => {
        setMessages(data);
        setTimeout(scrollToBottom, 50);
      })
      .catch(() => setMessages([]));

    // Clear unread in list
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConvId ? { ...c, unreadCount: 0 } : c))
    );
  }, [activeConvId]);

  // 3. Connect STOMP WebSocket with graceful polling fallback
  useEffect(() => {
    if (!user || !activeConvId) return;

    const rawWsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws";
    // SockJS client requires http/https scheme, translating internally to ws/wss
    const wsUrl = rawWsUrl.replace(/^ws:\/\//i, "http://").replace(/^wss:\/\//i, "https://");

    try {
      const client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          client.subscribe(`/topic/conversation.${activeConvId}`, (messageOutput) => {
            const newMsg: Message = JSON.parse(messageOutput.body);
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            setTimeout(scrollToBottom, 50);
          });
        },
      });

      client.activate();
      stompClientRef.current = client;

      return () => {
        client.deactivate();
      };
    } catch {
      // Fallback polling every 4 seconds if WebSockets cannot connect
      const interval = setInterval(() => {
        if (activeConvId) {
          apiFetch<Message[]>(`/api/conversations/${activeConvId}/messages`).then((data) => {
            setMessages(data);
          });
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [user, activeConvId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConvId) return;

    const currentText = messageText.trim();
    setMessageText("");

    try {
      const sent = await apiFetch<Message>("/api/conversations/messages", {
        method: "POST",
        body: JSON.stringify({
          conversationId: activeConvId,
          content: currentText,
        }),
      });

      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });

      // Update last message in left conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, lastMessageContent: currentText, lastMessageAt: new Date().toISOString() }
            : c
        )
      );

      setTimeout(scrollToBottom, 50);
    } catch {
      // Revert if failed
      setMessageText(currentText);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId);
  const otherUser = activeConversation?.otherUser;

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const name = c.otherUser?.name?.toLowerCase() || "";
    const username = c.otherUser?.username?.toLowerCase() || "";
    return name.includes(searchQuery.toLowerCase()) || username.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="bg-surface-light dark:bg-surface-dark hairline-border border rounded-apple-xl shadow-apple overflow-hidden flex h-[calc(100vh-10rem)] min-h-[550px]">
        {/* LEFT COLUMN: Conversation List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r hairline-border flex flex-col bg-surface-light dark:bg-surface-dark ${
            activeConvId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b hairline-border space-y-3">
            <h2 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark">
              Messages
            </h2>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-light" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] hairline-border border text-xs text-foreground-light dark:text-foreground-dark focus-visible:ring-2 focus-visible:ring-apple-blue"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y hairline-border">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 items-center animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-black/10 rounded w-1/2" />
                      <div className="h-2.5 bg-black/5 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-light">
                No active conversations. Propose a swap to start chatting with peers.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                const peer = conv.otherUser;
                const unread = conv.unreadCount || 0;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left p-3.5 transition-colors flex items-center gap-3 ${
                      isActive
                        ? "bg-black/[0.04] dark:bg-white/[0.08]"
                        : "hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-apple-lightGray dark:bg-apple-darkGray hairline-border border flex items-center justify-center font-bold text-xs shrink-0">
                      {getInitials(peer?.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-xs text-foreground-light dark:text-foreground-dark truncate">
                          {peer?.name || "Peer"}
                        </span>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-muted-light shrink-0">
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-light truncate mt-0.5">
                        {conv.lastMessageContent || "Start the conversation..."}
                      </p>
                    </div>

                    {unread > 0 && (
                      <span className="w-4 h-4 rounded-full bg-apple-blue text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Thread */}
        <div
          className={`flex-1 flex flex-col bg-surface-light dark:bg-surface-dark ${
            !activeConvId ? "hidden md:flex items-center justify-center" : "flex"
          }`}
        >
          {activeConvId && otherUser ? (
            <>
              {/* Chat Thread Header */}
              <div className="p-3.5 px-4 border-b hairline-border flex items-center justify-between bg-surface-light dark:bg-surface-dark">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveConvId(null)}
                    className="md:hidden p-1.5 rounded-full hover:bg-black/5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="w-9 h-9 rounded-full bg-apple-lightGray dark:bg-apple-darkGray hairline-border border flex items-center justify-center font-bold text-xs">
                    {getInitials(otherUser.name)}
                  </div>

                  <div>
                    <Link
                      href={`/profile/${otherUser.username}`}
                      className="font-semibold text-sm text-foreground-light dark:text-foreground-dark hover:underline block"
                    >
                      {otherUser.name}
                    </Link>
                    <span className="text-[10px] text-apple-green font-medium flex items-center gap-1">
                      <Circle className="w-2 h-2 fill-apple-green" />
                      Active Member
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/swaps/new?targetUserId=${otherUser.id}`}
                    className="py-1.5 px-3 rounded-full bg-apple-blue/10 text-apple-blue dark:text-apple-blueDark font-medium text-xs hover:bg-apple-blue/20 transition-colors flex items-center gap-1.5"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Swap Proposal</span>
                  </Link>
                </div>
              </div>

              {/* Chat Messages Stream (iMessage Bubbles) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-canvas-light dark:bg-canvas-dark">
                {messages.length === 0 ? (
                  <div className="text-center py-20 text-xs text-muted-light space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-muted-light/60" />
                    <p>No messages yet. Send a greeting to coordinate your skill swap session!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[78%] px-4 py-2.5 rounded-apple-lg text-sm leading-relaxed ${
                            isMe
                              ? "bg-apple-blue text-white rounded-br-sm shadow-sm"
                              : "bg-surface-light dark:bg-surface-dark text-foreground-light dark:text-foreground-dark rounded-bl-sm hairline-border border shadow-sm"
                          }`}
                        >
                          {msg.content}
                        </div>

                        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-light px-1">
                          <span>{formatTime(msg.createdAt)}</span>
                          {isMe && (
                            msg.readAt ? (
                              <CheckCheck className="w-3 h-3 text-apple-blue" />
                            ) : (
                              <Check className="w-3 h-3 text-muted-light" />
                            )
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t hairline-border bg-surface-light dark:bg-surface-dark flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Message ${otherUser.name}...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] hairline-border border text-sm text-foreground-light dark:text-foreground-dark placeholder-muted-light/60 focus-visible:ring-2 focus-visible:ring-apple-blue"
                />

                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="w-10 h-10 rounded-full bg-apple-blue hover:bg-apple-blue/90 text-white flex items-center justify-center shadow-sm disabled:opacity-40 transition-transform active:scale-95 shrink-0"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center p-8 text-muted-light space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto text-muted-light/60" />
              <p className="text-sm font-medium">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
