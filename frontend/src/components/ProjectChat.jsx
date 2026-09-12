import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';
import { getSocket } from '../services/socket';

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

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/projects/${projectId}/messages`);
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error('Failed to load project messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (msg.project === projectId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        setTypingUser(null);
      }
    };

    const handleUserTyping = (data) => {
      if (data.projectId === projectId && data.userId !== user?._id) {
        setTypingUser(data.userName);
      }
    };

    const handleUserStopTyping = (data) => {
      if (data.projectId === projectId && data.userId !== user?._id) {
        setTypingUser(null);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [projectId, user]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    const socket = getSocket();
    if (!socket) return;

    socket.emit('typing', {
      projectId,
      userId: user?._id,
      userName: user?.name,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { projectId });
    }, 2000);
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
      <div className="h-96 bg-[#0e1117] border border-[#1e2430] rounded-xl flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#0e1117] border border-[#1e2430] rounded-xl p-5 flex flex-col h-[580px]">
      {/* Chat Room Header */}
      <div className="pb-3 border-b border-[#1e2430] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">Project Real-Time Discussion</h3>
            <p className="text-[11px] text-slate-400 font-mono">Real-time team synchronization</p>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3.5 my-2 no-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <h4 className="text-xs font-medium text-slate-400">No Messages Yet</h4>
            <p className="text-xs text-slate-500 mt-0.5">Send a message to collaborate with your team.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === user?._id;
            return (
              <div
                key={msg._id}
                className={`flex items-start space-x-2.5 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-mono font-medium flex-shrink-0 ${
                    isMe
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#181d28] border border-[#2e374a] text-slate-200'
                  }`}
                >
                  {msg.sender?.name ? msg.sender.name.charAt(0) : 'U'}
                </div>

                <div className={`max-w-md ${isMe ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-center space-x-2 mb-1 justify-start">
                    <span className="text-xs font-medium text-slate-300">{msg.sender?.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-lg text-xs leading-relaxed whitespace-pre-line inline-block ${
                      isMe
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#131720] border border-[#1e2430] text-slate-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {typingUser && (
          <div className="flex items-center space-x-2 bg-[#131720] border border-[#1e2430] text-slate-300 text-xs px-3 py-1.5 rounded-lg w-fit">
            <span className="font-medium text-blue-400 text-xs">{typingUser} is typing</span>
            <div className="flex items-center space-x-1 pt-0.5">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="pt-2.5 border-t border-[#1e2430] flex items-center space-x-2">
        <input
          type="text"
          placeholder="Type a message to your team..."
          value={newMessage}
          onChange={handleInputChange}
          className="flex-1 bg-[#090a0f] border border-[#1e2430] focus:border-blue-500 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white p-2 rounded-lg transition flex items-center justify-center disabled:opacity-50"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
