import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Sparkles, Check, Trash2, Edit3, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { isLoggedIn, username, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const avatarMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  // Fetch notifications when logged in
  useEffect(() => {
    if (isLoggedIn && username) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [isLoggedIn, username]);

  // Listen for real-time Socket.io notification events
  useEffect(() => {
    if (!socket || !username) return;

    const handleNewNotification = (notif) => {
      if (notif && notif.recipientUsername === username) {
        setNotifications((prev) => [notif, ...prev]);
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-[#141214] shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-[#c9a84c]/40 border border-[#24221c] p-4 text-[#f5e6c8]`}
            >
              <div className="flex-1 w-0 flex items-start gap-3">
                <div className="p-2 bg-[#c9a84c]/10 text-[#c9a84c] rounded-xl">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#f5e6c8]">New Collaboration Invite!</p>
                  <p className="mt-1 text-xs text-[#9c9486]">{notif.message}</p>
                </div>
              </div>
            </div>
          ),
          { duration: 5000 }
        );
      }
    };

    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket, username]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
        setIsAvatarMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const baseUrl =
        import.meta.env.VITE_BASE_URL ||
        import.meta.env.REACT_APP_BASE_URL ||
        'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/notifications/${username}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      const baseUrl =
        import.meta.env.VITE_BASE_URL ||
        import.meta.env.REACT_APP_BASE_URL ||
        'http://localhost:5000';
      await fetch(`${baseUrl}/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const deleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      const baseUrl =
        import.meta.env.VITE_BASE_URL ||
        import.meta.env.REACT_APP_BASE_URL ||
        'http://localhost:5000';
      await fetch(`${baseUrl}/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const NavLink = ({ to, children, onClick }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'text-black bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] font-semibold shadow-md shadow-[#c9a84c]/25 border border-[#f5e6c8]/40'
            : 'text-[#a89e8f] hover:text-[#f5e6c8] hover:bg-[#1a1917]'
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0c]/90 backdrop-blur-md border-b border-[#24221c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Top-Left Notification Bell Section */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#e5ca7a] via-[#c9a84c] to-[#947230] flex items-center justify-center text-black font-extrabold text-lg shadow-md shadow-[#c9a84c]/20 border border-[#f5e6c8]/30 overflow-hidden p-1">
                <img
                  src="/Pen.jpg"
                  onError={(e) => { e.currentTarget.src = '/Pen.png'; }}
                  alt="BlogSphere Pen Logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-[#f5e6c8] group-hover:text-[#c9a84c] transition-colors">
                  Blog<span className="text-[#c9a84c]">Sphere</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#9c9486] -mt-1">
                  AI Powered Platform
                </span>
              </div>
            </Link>

            {/* Top-Left Notification Bell (Requirement 1) */}
            {isLoggedIn && (
              <div className="relative" ref={notifMenuRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 rounded-full bg-[#121214] hover:bg-[#1c1c1f] text-[#f5e6c8] border border-[#24221c] hover:border-[#c9a84c]/50 transition-all focus:outline-none"
                  title="Collaborator Notifications"
                >
                  <Bell className="w-5 h-5 text-[#c9a84c]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-amber-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center border-2 border-[#0a0a0c] shadow-lg animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popover Dropdown */}
                {isNotifOpen && (
                  <div className="absolute left-0 mt-3 w-80 sm:w-96 bg-[#121214] border border-[#24221c] rounded-3xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                    <div className="flex items-center justify-between px-5 py-4 bg-[#18181b] border-b border-[#24221c]">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#c9a84c]" />
                        <h3 className="text-sm font-bold text-[#f5e6c8]">Collaboration Invites</h3>
                      </div>
                      <span className="text-xs bg-[#c9a84c]/10 text-[#c9a84c] px-2.5 py-0.5 rounded-full border border-[#c9a84c]/20 font-semibold">
                        {notifications.length} Total
                      </span>
                    </div>

                    <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-[#24221c]">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-[#7c7569] text-xs">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#c9a84c]" />
                          No collaboration invites yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            className={`p-4 transition-colors flex items-start justify-between gap-3 ${
                              notif.isRead ? 'bg-[#121214] opacity-80' : 'bg-[#18181c]'
                            }`}
                          >
                            <div className="flex-1 space-y-1">
                              <p className="text-xs text-[#f5e6c8] leading-snug font-medium">
                                {notif.message}
                              </p>
                              <div className="pt-2">
                                <Link
                                  to={`/edit-blog/${notif.blogId}`}
                                  onClick={() => {
                                    markNotificationAsRead(notif._id);
                                    setIsNotifOpen(false);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-extrabold text-xs rounded-full hover:brightness-110 transition-all shadow-md no-underline"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Start Editing ✍️</span>
                                </Link>
                              </div>
                            </div>

                            <button
                              onClick={(e) => deleteNotif(e, notif._id)}
                              className="text-[#7c7569] hover:text-red-400 p-1 transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#121214] p-1.5 rounded-full border border-[#24221c]">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/allblog">All Blogs</NavLink>
            <NavLink to="/writeblog">Write Story</NavLink>
            <NavLink to="/myblogs">My Stories</NavLink>
            {isLoggedIn && <NavLink to="/chat">Chat</NavLink>}
            <NavLink to="/contact">Contact</NavLink>
          </nav>

          {/* Auth & User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative" ref={avatarMenuRef}>
                <button
                  onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                  className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#141416] border border-[#24221c] hover:border-[#c9a84c]/50 transition-all text-sm font-medium focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-full bg-[#c9a84c] text-black font-bold text-xs flex items-center justify-center shadow-sm">
                    {getInitials(username)}
                  </div>
                  <span className="text-[#f5e6c8] text-xs font-semibold">{username}</span>
                  <svg className="w-4 h-4 text-[#9c9486]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isAvatarMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#121214] border border-[#24221c] rounded-2xl shadow-2xl py-1 z-50 text-sm">
                    <div className="px-4 py-2.5 border-b border-[#24221c]">
                      <p className="text-xs text-[#9c9486]">Signed in as</p>
                      <p className="text-sm font-semibold text-[#f5e6c8] truncate">{username}</p>
                    </div>
                    <Link
                      to="/myblogs"
                      onClick={() => setIsAvatarMenuOpen(false)}
                      className="block px-4 py-2 text-[#d4c7b5] hover:bg-[#1f1e1b] hover:text-[#c9a84c] transition-colors"
                    >
                      My Dashboard
                    </Link>
                    <Link
                      to="/chat"
                      onClick={() => setIsAvatarMenuOpen(false)}
                      className="block px-4 py-2 text-[#d4c7b5] hover:bg-[#1f1e1b] hover:text-[#c9a84c] transition-colors"
                    >
                      Messages
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAvatarMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left block px-4 py-2 text-red-400 hover:bg-[#1f1e1b] transition-colors border-t border-[#24221c]"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 rounded-full text-xs font-bold text-black bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] hover:brightness-110 transition-all shadow-md shadow-[#c9a84c]/20"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-[#9c9486] hover:text-[#f5e6c8] hover:bg-[#1a1917] focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0c0c0e] border-b border-[#24221c] px-4 pt-2 pb-4 space-y-2">
          <NavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
          <NavLink to="/allblog" onClick={() => setIsMenuOpen(false)}>All Blogs</NavLink>
          <NavLink to="/writeblog" onClick={() => setIsMenuOpen(false)}>Write Story</NavLink>
          <NavLink to="/myblogs" onClick={() => setIsMenuOpen(false)}>My Stories</NavLink>
          {isLoggedIn && <NavLink to="/chat" onClick={() => setIsMenuOpen(false)}>Chat</NavLink>}
          <NavLink to="/about" onClick={() => setIsMenuOpen(false)}>About</NavLink>
          <NavLink to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</NavLink>
          {!isLoggedIn && (
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block text-center mt-3 px-4 py-2 rounded-full text-xs font-bold text-black bg-gradient-to-r from-[#e5ca7a] to-[#c9a84c]"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;