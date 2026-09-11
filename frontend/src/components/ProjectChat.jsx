import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Loader2, Sparkles } from 'lucide-react';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';
import { getSocket, initSocket } from '../services/socket';

export default function ProjectChat({ projectId }) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/projects/${projectId}/messages`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch chat messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    const socket = initSocket();

    if (socket) {
      socket.emit('join_project', projectId);

      // Listen for incoming messages
      socket.on('receive_message', (incomingMsg) => {
        const msgProjId = typeof incomingMsg.project === 'object' ? incomingMsg.project?._id : incomingMsg.project;
        if (msgProjId?.toString() === projectId?.toString()) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === incomingMsg._id)) return prev;
            return [...prev, incomingMsg];
          });
        }
      });

      // Listen for typing indicators
      socket.on('user_typing', ({ userName }) => {
        if (userName !== user?.name) {
          setTypingUser(userName);
        }
      });

      socket.on('user_stop_typing', () => {
        setTypingUser(null);
      });
    }

    return () => {
      if (socket) {
        socket.off('receive_message');
        socket.off('user_typing');
        socket.off('user_stop_typing');
      }
    };
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    const socket = getSocket();
    if (socket) {
      socket.emit('typing', { projectId, userName: user?.name });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { projectId });
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);

    const socket = getSocket();
    if (socket) {
      socket.emit('stop_typing', { projectId });
    }

    try {
      const res = await API.post(`/projects/${projectId}/messages`, {
        text: newMessage,
      });

      if (res.data.success && res.data.message) {
        const sentMsg = res.data.message;
        setMessages((prev) => {
          if (prev.some((m) => m._id === sentMsg._id)) return prev;
          return [...prev, sentMsg];
        });
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 bg-slate-900/60 border border-slate-800 rounded-3xl flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col h-[600px]">
      {/* Chat Room Header */}
      <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Project Real-Time Chat</h3>
            <p className="text-xs text-slate-400">Instant team communication powered by Socket.IO WebSockets</p>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 my-2 no-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <h4 className="text-sm font-bold text-slate-400">No Messages Yet</h4>
            <p className="text-xs text-slate-600 mt-1">Be the first to say hello to your project team!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === user?._id;
            return (
              <div
                key={msg._id}
                className={`flex items-start space-x-3 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0 ${
                    isMe
                      ? 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                >
                  {msg.sender?.name ? msg.sender.name.charAt(0) : 'U'}
                </div>

                <div className={`max-w-md ${isMe ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-center space-x-2 mb-1 justify-start">
                    <span className="text-xs font-bold text-slate-300">{msg.sender?.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line inline-block shadow-md ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* WhatsApp-style 3 Bouncing Dots Typing Indicator */}
        {typingUser && (
          <div className="flex items-center space-x-2.5 bg-slate-950/90 border border-slate-800 text-slate-300 text-xs px-4 py-2 rounded-2xl w-fit shadow-lg">
            <span className="font-bold text-indigo-400 text-xs">{typingUser}</span>
            <div className="flex items-center space-x-1 pt-0.5">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 flex items-center space-x-3">
        <input
          type="text"
          placeholder="Type a message to your team..."
          value={newMessage}
          onChange={handleInputChange}
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold p-3 rounded-xl transition flex items-center justify-center shadow-lg shadow-indigo-600/25 disabled:opacity-50"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
