import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Edit, Trash2, Heart, MessageCircle, X, Save, Eye, Sparkles, Clock, User, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // adjust path as needed
import Blogcard from '../components/Blogcard';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const MyBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const { username: currentUser } = useAuth();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleAddComment = async (blogId) => {
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || import.meta.env.REACT_APP_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/blogs/${blogId}/comment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newComment: `${currentUser ? `@${currentUser}: ` : ''}${commentText.trim()}`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedBlog(data);
        setBlogs(blogs.map((b) => (b._id === data._id ? data : b)));
        setCommentText('');
        toast.success('Comment posted successfully! 💬');
      } else {
        toast.error(data.error || 'Failed to post comment');
      }
    } catch (err) {
      toast.error('Error posting comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const renderRichDescription = (description) => {
    if (!description) return null;
    const hasHtml = /<[a-z][\s\S]*>/i.test(description);

    if (hasHtml) {
      return (
        <div
          className="rich-blog-content text-[#f5e6c8]/90 leading-relaxed text-base sm:text-lg space-y-4"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      );
    }

    return (
      <div className="text-[#f5e6c8]/90 leading-relaxed text-base sm:text-lg space-y-4">
        {description.split('\n\n').map((para, i) => (
          <p key={i} className="mb-4">
            {para.split('\n').map((line, j, arr) => (
              <React.Fragment key={j}>
                {line}
                {j !== arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        ))}
      </div>
    );
  };

  useEffect(() => {
    setIsLoaded(true);
    if (currentUser) {
      fetchBlogs();
    }
  }, [currentUser]);


  const fetchBlogs = async () => {
    setLoading(true);
    try {
      //console.log('Current user from context:', currentUser);

      const res = await fetch(`${(import.meta.env.VITE_BASE_URL || import.meta.env.REACT_APP_BASE_URL || 'http://localhost:5000')}/api/blogs/username/${currentUser}`);
      const data = await res.json();
      //console.log(data);
      setBlogs(data);
    } catch (error) {
      toast.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBlog = async (e, blogId) => {
    e.preventDefault();

    try {
      const res = await fetch(`${(import.meta.env.VITE_BASE_URL || import.meta.env.REACT_APP_BASE_URL || 'http://localhost:5000')}/api/blogs/${blogId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editFormData.title,
          image: editFormData.image, // Required by your model
          description: editFormData.content,
          choice: editFormData.choice,
          username: selectedBlog.username,
          author: selectedBlog.author || '',
        }),
      });

      const updated = await res.json();
      setBlogs(blogs.map(b => (b._id === updated._id ? updated : b)));
      setShowEditModal(false);
      setSelectedBlog(updated);
      toast.success('Blog updated successfully!')
    } catch (error) {
      toast.error('Update failed')
    }
  };


  const handleDelete = (blogId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this blog? This action cannot be undone.');
    if (confirmDelete) {
      deleteBlog(blogId);
    }
  };

  const deleteBlog = async (blogId) => {
    try {
      await fetch(`${(import.meta.env.VITE_BASE_URL || import.meta.env.REACT_APP_BASE_URL || 'http://localhost:5000')}/api/blogs/${blogId}`, { method: 'DELETE' });
      setBlogs(blogs.filter(blog => blog._id !== blogId));
      if (selectedBlog && selectedBlog._id === blogId) {
        setShowDetailModal(false);
        setSelectedBlog(null);
      }
      toast.success('Blog deleted successfully!')
    } catch (error) {
      //console.error('Error deleting blog:', error);
      toast.error('Error deleting blog. Please try again.')
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0a0a0c]">
        <div className="relative">
          <div className="animate-spin rounded-full h-24 w-24 border-4 border-[#24221c] border-t-[#c9a84c]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#c9a84c] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f5e6c8] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with animated background */}
        <div className="relative mb-12 text-center">
          <div className="absolute inset-0 bg-[#c9a84c]/5 blur-3xl transform -skew-y-1"></div>
          <div className="relative">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-[#f5e6c8] via-[#c9a84c] to-[#e5ca7a] bg-clip-text text-transparent mb-4">
              My Blogs
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] mx-auto rounded-full"></div>
          </div>
        </div>

        {(blogs.length == 0 && currentUser == null) && (
          <div className="relative py-12">
            <div className="relative z-10 max-w-2xl mx-auto text-center">
              <div className="bg-[#121214] rounded-3xl p-12 shadow-2xl border border-[#24221c]">
                <div className="mb-8 relative">
                  <h2 className="text-3xl font-extrabold text-[#f5e6c8] leading-tight mb-3">
                    Ready to Share Your Story?
                  </h2>
                  <div className="w-16 h-1 bg-[#c9a84c] mx-auto rounded-full"></div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Link
                    to="/login"
                    className="inline-block px-8 py-4 bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-extrabold text-base rounded-full shadow-lg hover:brightness-110 transition-all duration-300 min-w-32 no-underline"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="inline-block px-8 py-4 border border-[#24221c] hover:border-[#c9a84c]/50 text-[#f5e6c8] font-bold text-base rounded-full bg-[#141416] transition-all duration-300 min-w-32 no-underline"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {(blogs.length == 0 && currentUser != null) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center justify-center min-h-[50vh] px-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6, type: "spring", bounce: 0.4 }}
                className="text-5xl mb-6"
              >
                ✨
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#f5e6c8] via-[#c9a84c] to-[#e5ca7a] bg-clip-text text-transparent mb-4 leading-tight"
                >
                  Your Journey Begins Here
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="text-lg text-[#9c9486] mb-8 max-w-2xl mx-auto leading-relaxed font-normal"
                >
                  You are about to start inspiring the world through your
                  <span className="text-[#c9a84c] font-semibold"> pen and thoughts</span>.
                  Every great writer started with a single word.
                </motion.p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/writeblog"
                  className="inline-flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-extrabold text-lg rounded-full shadow-lg hover:brightness-110 transition-all duration-300 no-underline"
                >
                  <span>Write Your First Blog</span>
                  <span>✍️</span>
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="text-[#7c7569] italic text-center mt-8 max-w-md text-sm"
              >
                "The secret to getting ahead is getting started." - Mark Twain
              </motion.p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
          {blogs && blogs.map((post, index) => (
            <div
              key={post._id}
              className={`group transition-all duration-700 hover:scale-105 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="relative p-1 rounded-3xl bg-[#111113] border border-[#24221c] hover:border-[#c9a84c]/50 transition-all duration-300 shadow-xl">
                <Blogcard
                  _id={post._id}
                  image={post.image}
                  title={post.title}
                  description={post.description}
                  likes={post.likes}
                  likedBy={post.likedBy}
                  author={post.author}
                  timestamp={post.timestamps}
                  onReadMore={() => {
                    setSelectedBlog(post)
                    setShowDetailModal(true)
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Showing complete modal */}
        {selectedBlog && showDetailModal && (
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 pt-0 bg-black/80 backdrop-blur-md"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedBlog(null);
            }}
          >
            <div className="relative w-[90%] h-[95%] animate-slideUp z-10">
              <div className="relative bg-[#121214] rounded-3xl border border-[#24221c] shadow-2xl h-full flex flex-col overflow-hidden">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="absolute top-6 right-6 z-30 group"
                >
                  <div className="p-3 bg-[#1c1c1f] rounded-2xl border border-[#24221c] hover:border-[#c9a84c] text-[#f5e6c8] hover:text-[#c9a84c] transition-all duration-300 shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </button>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {/* Hero Image Section */}
                  <div className="relative h-[45vh] overflow-hidden">
                    <img
                      src={selectedBlog.image}
                      alt={selectedBlog.title}
                      className="w-full h-full object-cover rounded-t-3xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-transparent to-transparent" />

                    {/* Bottom Title Preview */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="bg-[#0a0a0c]/80 backdrop-blur-md rounded-2xl p-6 border border-[#24221c]">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-[#f5e6c8] mb-3 leading-tight">
                          {selectedBlog.title}
                        </h1>
                        <div className="flex items-center space-x-4 text-[#9c9486]">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-[#dfc067] to-[#c9a84c] text-black font-bold rounded-full mr-2 flex items-center justify-center text-sm">
                              {selectedBlog.author.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-[#f5e6c8]">By {selectedBlog.author}</span>
                          </div>
                          <span>•</span>
                          <span>{selectedBlog.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 md:p-12">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#24221c]">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2 text-[#c9a84c]">
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          <span className="font-semibold text-[#f5e6c8]">{selectedBlog.likes} likes</span>
                        </div>

                        <div className="flex items-center space-x-2 text-[#9c9486]">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="font-medium text-[#f5e6c8]">{selectedBlog.comments?.length || 0} comments</span>
                        </div>
                      </div>
                    </div>

                    {/* Article Body with Rich HTML Styling (Requirement 4) */}
                    {renderRichDescription(selectedBlog.description)}

                    {/* Comments Section & Input Form (Requirement 5) */}
                    <div className="mt-12">
                      <h3 className="text-2xl font-bold text-[#f5e6c8] mb-6 flex items-center gap-2">
                        <span>Comments</span>
                        <span className="text-[#c9a84c] font-normal text-lg">
                          ({selectedBlog.comments?.length || 0})
                        </span>
                      </h3>

                      {/* Interactive Add Comment Form */}
                      <div className="mb-8 p-5 bg-[#141416] rounded-2xl border border-[#24221c]">
                        <textarea
                          placeholder="Write a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          rows={3}
                          className="w-full p-3.5 bg-[#0a0a0c] text-[#f5e6c8] placeholder-[#7c7569] text-sm rounded-xl border border-[#24221c] focus:border-[#c9a84c] focus:outline-none resize-none mb-3"
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleAddComment(selectedBlog._id)}
                            disabled={isSubmittingComment || !commentText.trim()}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-extrabold text-xs rounded-full hover:brightness-110 transition-all shadow-md disabled:opacity-40"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>{isSubmittingComment ? 'Posting Comment...' : 'Post Comment'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-4">
                        {selectedBlog.comments && selectedBlog.comments.length > 0 ? (
                          selectedBlog.comments.map((comment, index) => (
                            <div key={index} className="p-4 bg-[#18181a] rounded-xl border border-[#24221c]">
                              <p className="text-[#f5e6c8] text-sm leading-relaxed">
                                {comment.content || comment.text || comment.message || comment}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 bg-[#18181a] rounded-xl border border-[#24221c] text-[#7c7569] text-sm">
                            No comments yet. Be the first to start the conversation!
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-[#24221c]">
                      <div className="flex flex-wrap gap-4">
                        <Link
                          to={`/edit-blog/${selectedBlog._id}`}
                          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-extrabold rounded-full hover:brightness-110 transition-all duration-300 no-underline shadow-lg"
                        >
                          <Users className="w-5 h-5" />
                          <span>Live Collaborative Edit</span>
                        </Link>

                        <button
                          className="flex items-center space-x-2 px-6 py-3 bg-[#18181a] border border-[#24221c] text-[#f5e6c8] font-bold rounded-full hover:border-[#c9a84c] transition-all duration-300"
                          onClick={() => {
                            setEditFormData({
                              title: selectedBlog.title,
                              content: selectedBlog.description,
                              image: selectedBlog.image,
                              choice: selectedBlog.choice || 'public',
                            });
                            setShowEditModal(true);
                            setShowDetailModal(false);
                          }}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                          <span>Quick Edit</span>
                        </button>

                        <button
                          onClick={() => handleDelete(selectedBlog._id)}
                          className="flex items-center space-x-2 px-6 py-3 bg-[#1a1212] border border-red-500/30 text-red-400 font-bold rounded-full hover:bg-red-500/10 transition-all duration-300"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedBlog && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[10000] p-4">
            <div className="bg-[#121214] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#24221c] p-8 shadow-2xl relative custom-scrollbar">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#24221c]">
                <h2 className="text-2xl font-bold text-[#f5e6c8] flex items-center gap-3">
                  <Edit className="w-6 h-6 text-[#c9a84c]" />
                  <span>Edit Blog</span>
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-[#9c9486] hover:text-[#f5e6c8] rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#f5e6c8] mb-2">Title</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full p-4 bg-[#0a0a0c] border border-[#24221c] rounded-xl text-[#f5e6c8] focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#f5e6c8] mb-2">Content</label>
                  <textarea
                    value={editFormData.content}
                    onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                    rows={10}
                    className="w-full p-4 bg-[#0a0a0c] border border-[#24221c] rounded-xl text-[#f5e6c8] focus:border-[#c9a84c] focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#f5e6c8] mb-2">Image URL</label>
                  <input
                    type="text"
                    value={editFormData.image}
                    onChange={(e) => setEditFormData({ ...editFormData, image: e.target.value })}
                    className="w-full p-4 bg-[#0a0a0c] border border-[#24221c] rounded-xl text-[#f5e6c8] focus:border-[#c9a84c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#f5e6c8] mb-2">Visibility</label>
                  <select
                    value={editFormData.choice}
                    onChange={(e) => setEditFormData({ ...editFormData, choice: e.target.value })}
                    className="w-full p-4 bg-[#0a0a0c] border border-[#24221c] rounded-xl text-[#f5e6c8] focus:border-[#c9a84c] focus:outline-none cursor-pointer"
                  >
                    <option value="public" className="bg-[#121214] text-[#f5e6c8]">Public - Visible to everyone</option>
                    <option value="private" className="bg-[#121214] text-[#f5e6c8]">Private - Secret post</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={(e) => handleUpdateBlog(e, selectedBlog._id)}
                    className="flex-1 bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-extrabold py-4 px-6 rounded-full hover:brightness-110 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>Update Blog</span>
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-[#18181a] border border-[#24221c] hover:border-[#c9a84c]/50 text-[#f5e6c8] font-bold py-4 px-6 rounded-full transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBlogs;
