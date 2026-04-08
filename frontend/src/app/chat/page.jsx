"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { io } from "socket.io-client";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

export default function ChatPage() {
  const { user, API } = useAuth();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("user");

  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Connect socket
    socketRef.current = io(API);

    if (user?._id) {
      socketRef.current.emit("user-online", user._id);
    }

    socketRef.current.on("online-users", (users) => setOnlineUsers(users));

    socketRef.current.on("new-message", (msg) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
      loadConversations(); // refresh sidebar
    });

    socketRef.current.on("message-sent", (msg) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
    });

    socketRef.current.on("user-typing", () => setTyping(true));
    socketRef.current.on("user-stop-typing", () => setTyping(false));

    loadConversations();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (targetUserId && conversations.length === 0) {
      // Direct message from profile page
      startNewConversation(targetUserId);
    }
  }, [targetUserId]);

  const loadConversations = async () => {
    try {
      const res = await axios.get(`${API}/messages/conversations`);
      setConversations(res.data || []);

      // Auto-select conversation if target user is specified
      if (targetUserId) {
        const existing = res.data.find(c => c.otherUser?._id === targetUserId);
        if (existing) selectConversation(existing);
      }
    } catch (err) { console.log(err); } finally { setLoading(false); }
  };

  const startNewConversation = async (userId) => {
    try {
      const res = await axios.get(`${API}/user/profile/${userId}`);
      const fakeConvo = {
        conversationId: [user._id, userId].sort().join("_"),
        otherUser: res.data,
        lastMessage: "",
        unreadCount: 0,
      };
      setActiveConvo(fakeConvo);
      setMessages([]);
    } catch (err) { console.log(err); }
  };

  const selectConversation = async (convo) => {
    setActiveConvo(convo);
    try {
      const res = await axios.get(`${API}/messages/${convo.conversationId}`);
      setMessages(res.data || []);
      scrollToBottom();
    } catch (err) { console.log(err); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConvo) return;

    const receiverId = activeConvo.otherUser._id;

    // Send via socket for real-time
    socketRef.current.emit("send-message", {
      senderId: user._id,
      receiverId,
      content: newMessage,
    });

    setNewMessage("");
    socketRef.current.emit("stop-typing", { senderId: user._id, receiverId });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (activeConvo) {
      socketRef.current.emit("typing", {
        senderId: user._id,
        receiverId: activeConvo.otherUser._id,
      });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit("stop-typing", {
          senderId: user._id,
          receiverId: activeConvo.otherUser._id,
        });
      }, 1500);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <DashboardLayout>
      <div style={{ display: "flex", height: "calc(100vh - 120px)", gap: 0, borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-subtle)", background: "var(--bg-card)" }}>
        {/* Conversation List */}
        <div style={{ width: 300, borderRight: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "16px", borderBottom: "1px solid var(--border-subtle)" }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700 }}>💬 Messages</h2>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {conversations.length > 0 ? conversations.map(c => (
              <div
                key={c.conversationId}
                onClick={() => selectConversation(c)}
                style={{
                  padding: "14px 16px", cursor: "pointer", borderBottom: "1px solid var(--border-subtle)",
                  display: "flex", alignItems: "center", gap: 12,
                  background: activeConvo?.conversationId === c.conversationId ? "rgba(99,102,241,0.08)" : "transparent",
                  transition: "background 0.2s",
                }}
              >
                <div style={{ position: "relative" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(99,102,241,0.15)", color: "var(--primary-300)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, overflow: "hidden" }}>
                    {c.otherUser?.avatar ? <img src={c.otherUser.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : c.otherUser?.name?.[0]?.toUpperCase()}
                  </div>
                  {onlineUsers.includes(c.otherUser?._id) && (
                    <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#34d399", border: "2px solid var(--bg-secondary)" }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.otherUser?.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.lastMessage}</div>
                </div>
                {c.unreadCount > 0 && (
                  <span style={{ background: "var(--primary-500)", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{c.unreadCount}</span>
                )}
              </div>
            )) : (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>
                No conversations yet. Connect with someone to start chatting!
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {activeConvo ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.02)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(99,102,241,0.15)", color: "var(--primary-300)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, overflow: "hidden" }}>
                  {activeConvo.otherUser?.avatar ? <img src={activeConvo.otherUser.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : activeConvo.otherUser?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{activeConvo.otherUser?.name}</div>
                  <div style={{ fontSize: 11, color: onlineUsers.includes(activeConvo.otherUser?._id) ? "#34d399" : "var(--text-tertiary)" }}>
                    {typing ? "typing..." : onlineUsers.includes(activeConvo.otherUser?._id) ? "Online" : "Offline"}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 10 }}>
                {messages.map((msg, i) => {
                  const isMine = msg.senderId?._id === user._id || msg.senderId === user._id;
                  return (
                    <div key={msg._id || i} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "70%", padding: "10px 16px", borderRadius: 16,
                        background: isMine ? "var(--gradient-brand)" : "rgba(255,255,255,0.05)",
                        border: isMine ? "none" : "1px solid var(--border-subtle)",
                        color: isMine ? "#fff" : "var(--text-primary)",
                        borderBottomRightRadius: isMine ? 4 : 16,
                        borderBottomLeftRadius: isMine ? 16 : 4,
                      }}>
                        <p style={{ fontSize: 14, lineHeight: 1.5 }}>{msg.content}</p>
                        <span style={{ fontSize: 10, opacity: 0.6, display: "block", textAlign: "right", marginTop: 4 }}>
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: 10 }}>
                <input
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.03)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" }}
                />
                <button onClick={sendMessage} className="btn-primary" style={{ padding: "10px 24px", fontSize: 14 }}>Send</button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "var(--text-tertiary)" }}>
              <span style={{ fontSize: 48 }}>💬</span>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>Select a conversation</h3>
              <p style={{ fontSize: 14 }}>Choose a conversation from the sidebar to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
