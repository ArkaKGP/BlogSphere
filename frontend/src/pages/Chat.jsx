import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Search,
  Send,
  User as UserIcon,
  MessageSquare,
  Sparkles,
  Circle,
  CheckCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user, isLoggedIn } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);

  const BASE_URL =
    import.meta.env.VITE_BASE_URL ||
    import.meta.env.REACT_APP_BASE_URL ||
    'http://localhost:5000';

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Auto scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch users & user conversations on component mount
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchData = async () => {
      setLoadingUsers(true);
      try {
        const [usersRes, convsRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/chat/users`, getHeaders()),
          axios.get(`${BASE_URL}/api/chat/conversations`, getHeaders()),
        ]);

        setUsers(usersRes.data);
        setConversations(convsRes.data);
      } catch (err) {
        console.error('Error fetching chat data:', err);
        toast.error('Failed to load chat users');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchData();
  }, [isLoggedIn]);

  // Listen for incoming real-time socket messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (
        activeConversation &&
        newMessage.conversationId === activeConversation._id
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }

      // Update conversations list last message
      setConversations((prevConvs) =>
        prevConvs.map((conv) => {
          if (conv._id === newMessage.conversationId) {
            return {
              ...conv,
              lastMessage: newMessage,
              updatedAt: new Date().toISOString(),
            };
          }
          return conv;
        })
      );
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, activeConversation]);

  // Handle selecting a user to start/continue a chat
  const handleSelectUser = async (targetUser) => {
    setSelectedUser(targetUser);
    setLoadingMessages(true);

    try {
      // 1. Get or create conversation
      const convRes = await axios.get(
        `${BASE_URL}/api/chat/conversations/with/${targetUser._id}`,
        getHeaders()
      );
      const conv = convRes.data;
      setActiveConversation(conv);

      // 2. Fetch message history
      const msgsRes = await axios.get(
        `${BASE_URL}/api/chat/messages/${conv._id}`,
        getHeaders()
      );
      setMessages(msgsRes.data);
    } catch (err) {
      console.error('Error opening conversation:', err);
      toast.error('Failed to open chat');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send message handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConversation || !selectedUser || !user?._id) return;

    const messageData = {
      senderId: user._id,
      receiverId: selectedUser._id,
      text: text.trim(),
      conversationId: activeConversation._id,
    };

    if (socket) {
      socket.emit('sendMessage', messageData);
    } else {
      toast.error('Socket disconnected. Please refresh.');
    }

    setText('');
  };

  // Utility to check online status
  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  // Filter users by search query
  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper for initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((w) => w[0].toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Format timestamp
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
        <div className="text-center bg-[#121214] border border-[#24221c] p-8 rounded-3xl max-w-md">
          <MessageSquare className="w-12 h-12 text-[#c9a84c] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#f5e6c8] mb-2">Access Denied</h2>
          <p className="text-[#9c9486] text-sm mb-6">
            Please sign in to access real-time 1-on-1 direct messaging.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a0c] text-[#f5e6c8] p-4 lg:p-6">
      <div className="max-w-7xl mx-auto h-[85vh] bg-[#121214] border border-[#24221c] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* LEFT SIDEBAR: Users & Conversations */}
        <div className="w-full md:w-80 lg:w-96 bg-[#0e0e10] border-r border-[#24221c] flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-[#24221c] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-[#dfc067] to-[#c9a84c] rounded-xl text-black">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-[#f5e6c8]">Messages</h2>
            </div>
            <span className="text-xs px-2.5 py-1 bg-[#1a191c] border border-[#2e2a22] text-[#c9a84c] rounded-full font-medium">
              {onlineUsers.length} Online
            </span>
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-[#24221c]">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#9c9486]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0c] border border-[#24221c] rounded-xl text-sm text-[#f5e6c8] placeholder-[#7c7569] focus:outline-none focus:border-[#c9a84c] transition-colors"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1e1c18]/50">
            {loadingUsers ? (
              <div className="flex items-center justify-center p-8 text-[#9c9486]">
                <div className="w-6 h-6 border-2 border-[#c9a84c]/30 border-t-[#c9a84c] rounded-full animate-spin"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center p-8 text-[#9c9486] text-sm">
                No users found
              </div>
            ) : (
              filteredUsers.map((u) => {
                const online = isUserOnline(u._id);
                const isSelected = selectedUser?._id === u._id;

                return (
                  <button
                    key={u._id}
                    onClick={() => handleSelectUser(u)}
                    className={`w-full p-4 flex items-center space-x-3 text-left transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#1e1c18] border-l-4 border-[#c9a84c]'
                        : 'hover:bg-[#151518]'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#e5ca7a]/20 to-[#c9a84c]/40 border border-[#c9a84c]/30 text-[#f5e6c8] font-bold text-sm flex items-center justify-center">
                        {getInitials(u.username)}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0e0e10] ${
                          online ? 'bg-emerald-500' : 'bg-gray-600'
                        }`}
                      ></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#f5e6c8] truncate">
                          {u.username}
                        </p>
                        {online && (
                          <span className="text-[10px] text-emerald-400 font-medium">
                            Online
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#9c9486] truncate">
                        {u.email}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT CHAT WINDOW */}
        <div className="flex-1 flex flex-col h-full bg-[#121214]">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#24221c] bg-[#0e0e10] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[#c9a84c] text-black font-bold text-sm flex items-center justify-center">
                      {getInitials(selectedUser.username)}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0e0e10] ${
                        isUserOnline(selectedUser._id)
                          ? 'bg-emerald-500'
                          : 'bg-gray-600'
                      }`}
                    ></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#f5e6c8]">
                      {selectedUser.username}
                    </h3>
                    <p className="text-xs text-[#9c9486]">
                      {isUserOnline(selectedUser._id) ? (
                        <span className="text-emerald-400 font-medium">
                          Online
                        </span>
                      ) : (
                        'Offline'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0a0a0c]/50">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-[#9c9486]">
                    <div className="w-8 h-8 border-2 border-[#c9a84c]/30 border-t-[#c9a84c] rounded-full animate-spin"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#9c9486] text-center p-6 space-y-2">
                    <Sparkles className="w-10 h-10 text-[#c9a84c]/60" />
                    <p className="text-base font-semibold text-[#f5e6c8]">
                      No messages yet
                    </p>
                    <p className="text-xs text-[#9c9486]">
                      Send a message to start the conversation with{' '}
                      <span className="text-[#c9a84c]">
                        {selectedUser.username}
                      </span>
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === user?._id;

                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-3 shadow-md ${
                            isMe
                              ? 'bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-medium rounded-br-none'
                              : 'bg-[#1a191c] border border-[#2e2a22] text-[#f5e6c8] rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                            {msg.text}
                          </p>
                          <div
                            className={`flex items-center justify-end space-x-1 mt-1 text-[10px] ${
                              isMe ? 'text-black/70 font-semibold' : 'text-[#9c9486]'
                            }`}
                          >
                            <span>{formatTime(msg.createdAt)}</span>
                            {isMe && <CheckCheck className="w-3.5 h-3.5 text-black/80 ml-0.5" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-[#24221c] bg-[#0e0e10] flex items-center space-x-3"
              >
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Message ${selectedUser.username}...`}
                  className="flex-1 px-4 py-3 bg-[#0a0a0c] border border-[#24221c] rounded-full text-sm text-[#f5e6c8] placeholder-[#7c7569] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="p-3 bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-bold rounded-full hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-[#c9a84c]/20 flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          ) : (
            /* Empty State when no user selected */
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#1a191c] border border-[#24221c] flex items-center justify-center text-[#c9a84c] shadow-inner">
                <MessageSquare className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#f5e6c8]">
                  Your Messages
                </h3>
                <p className="text-sm text-[#9c9486] max-w-sm">
                  Select a registered creator from the left sidebar to start real-time direct messaging.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
