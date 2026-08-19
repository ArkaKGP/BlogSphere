import React, { useEffect, useState } from 'react';
import Blogcard from '../components/Blogcard';
import { useAuth } from '../context/AuthContext';
import { MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Allblogs = () => {
  const [blogs, setBlogs] = useState(null);
  const [visibleBlogs, setVisibleBlogs] = useState(6);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const { username: currentUser } = useAuth();

  // Search & Semantic AI Toggle states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSemantic, setIsSemantic] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearch, setActiveSearch] = useState('');

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
        if (blogs) {
          setBlogs(blogs.map((b) => (b._id === data._id ? data : b)));
        }
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
          className="rich-blog-content text-[#d4c7b5] text-base leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      );
    }

    return (
      <p className="text-[#d4c7b5] text-base leading-relaxed whitespace-pre-line">
        {description}
      </p>
    );
  };

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${(import.meta.env.VITE_BASE_URL || import.meta.env.REACT_APP_BASE_URL || 'http://localhost:5000')}/api/blogs`);
      const json = await response.json();

      if (response.ok) {
        setBlogs(json);
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      setActiveSearch('');
      fetchBlogs();
      return;
    }

    setIsSearching(true);
    setActiveSearch(query);

    try {
      if (isSemantic) {
        const res = await fetch(
          `${(import.meta.env.VITE_BASE_URL || import.meta.env.REACT_APP_BASE_URL || 'http://localhost:5000')}/api/blogs/search/semantic?query=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        if (res.ok) {
          setBlogs(data);
        }
      } else {
        const res = await fetch(`${(import.meta.env.VITE_BASE_URL || import.meta.env.REACT_APP_BASE_URL || 'http://localhost:5000')}/api/blogs`);
        const all = await res.json();
        if (res.ok) {
          const filtered = all.filter(
            b =>
              b.title?.toLowerCase().includes(query.toLowerCase()) ||
              b.description?.toLowerCase().includes(query.toLowerCase()) ||
              (b.tags && b.tags.some(t => t.toLowerCase().includes(query.toLowerCase())))
          );
          setBlogs(filtered);
        }
      }
    } catch (err) {
      console.error('Search execution error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    fetchBlogs();
  };

  const loadMoreBlogs = () => {
    setVisibleBlogs(prev => Math.min(prev + 3, blogs?.length || 0));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f5e6c8] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#f5e6c8] mb-4">
            Publications Repository
          </h1>
          <p className="text-base text-[#9c9486] font-normal">
            Query across our publication database using traditional keyword matching or high-dimensional semantic vector embeddings.
          </p>
        </div>

        {/* Search Bar & Mode Switcher */}
        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2 p-2.5 bg-[#121214] border border-[#24221c] rounded-full shadow-lg">
            <div className="flex-1 w-full flex items-center px-4">
              <svg className="w-5 h-5 text-[#c9a84c] mr-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isSemantic ? "Semantic AI Vector Search (e.g. 'machine learning', 'cloud')..." : "Keyword Search..."}
                className="w-full bg-transparent text-[#f5e6c8] text-sm placeholder-[#7c7569] focus:outline-none py-2"
              />
              {searchQuery && (
                <button type="button" onClick={clearSearch} className="text-[#9c9486] hover:text-[#f5e6c8] text-xs px-2">
                  Clear
                </button>
              )}
            </div>

            {/* Mode Switcher Buttons */}
            <div className="flex items-center space-x-1 bg-[#0a0a0c] p-1 rounded-full border border-[#24221c] shrink-0">
              <button
                type="button"
                onClick={() => setIsSemantic(false)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  !isSemantic ? 'bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black' : 'text-[#9c9486] hover:text-[#f5e6c8]'
                }`}
              >
                Keyword
              </button>
              <button
                type="button"
                onClick={() => setIsSemantic(true)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isSemantic ? 'bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black' : 'text-[#9c9486] hover:text-[#f5e6c8]'
                }`}
              >
                🧠 Semantic AI
              </button>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black rounded-full font-extrabold text-xs transition-all hover:brightness-110 shadow-md shrink-0"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {activeSearch && (
            <div className="mt-3 flex items-center justify-between text-xs text-[#9c9486] px-4">
              <span>
                Active Search Query: <strong className="text-[#c9a84c]">"{activeSearch}"</strong> ({isSemantic ? '384-d Cosine Vector Match' : 'Keyword Match'})
              </span>
              <button onClick={clearSearch} className="underline hover:text-[#f5e6c8]">
                Reset Search
              </button>
            </div>
          )}
        </div>

        {/* Blog Grid */}
        {blogs && blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {blogs.slice(0, visibleBlogs).map((post) => (
              <Blogcard
                key={post._id}
                _id={post._id}
                image={post.image}
                title={post.title}
                description={post.description}
                tags={post.tags}
                summary={post.summary}
                likes={post.likes}
                likedBy={post.likedBy}
                author={post.author}
                timestamp={post.timestamps}
                onReadMore={() => setSelectedBlog(post)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-[#9c9486]">
            <p className="text-base font-medium">No publications found matching your query.</p>
            <button
              onClick={clearSearch}
              className="mt-4 px-5 py-2.5 bg-[#141416] hover:bg-[#1f1e1b] text-[#f5e6c8] rounded-full text-xs font-bold border border-[#24221c]"
            >
              Clear Filter
            </button>
          </div>
        )}

        {blogs && visibleBlogs < blogs.length && (
          <div className="text-center">
            <button
              onClick={loadMoreBlogs}
              className="px-6 py-3 bg-[#141416] hover:bg-[#1f1e1b] border border-[#24221c] hover:border-[#c9a84c]/50 text-[#f5e6c8] rounded-full text-xs font-bold transition-all"
            >
              Load More Publications
            </button>
          </div>
        )}

        {/* Reader Modal */}
        {selectedBlog && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedBlog(null);
            }}
          >
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#121214] border border-[#24221c] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
              <button
                onClick={() => setSelectedBlog(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#0a0a0c]/80 text-[#9c9486] hover:text-[#f5e6c8] border border-[#24221c] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <img
                  src={selectedBlog.image}
                  alt={selectedBlog.title}
                  className="w-full h-72 object-cover rounded-2xl mb-6 bg-[#0a0a0c]"
                />

                {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedBlog.tags.map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#f5e6c8]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#f5e6c8] mb-4 leading-tight">
                  {selectedBlog.title}
                </h1>

                {selectedBlog.summary && (
                  <div className="mb-6 p-4 rounded-2xl bg-[#0a0a0c] border border-[#c9a84c]/25">
                    <div className="text-xs font-semibold text-[#c9a84c] mb-1 uppercase tracking-wider">
                      ⚡ AI Extractive Summary
                    </div>
                    <p className="text-[#d4c7b5] text-sm italic leading-relaxed">
                      "{selectedBlog.summary}"
                    </p>
                  </div>
                )}

                {/* Rich HTML Content Rendering (Requirement 4) */}
                <div className="mb-8">
                  {renderRichDescription(selectedBlog.description)}
                </div>

                {/* Comments Section (Requirement 5) */}
                <div className="mt-8 pt-8 border-t border-[#24221c]">
                  <h3 className="text-xl font-bold text-[#f5e6c8] mb-4 flex items-center gap-2">
                    <span>Comments</span>
                    <span className="text-[#c9a84c] text-sm">({selectedBlog.comments?.length || 0})</span>
                  </h3>

                  {/* Add Comment Input Form */}
                  <div className="mb-6 p-4 bg-[#141416] rounded-2xl border border-[#24221c]">
                    <textarea
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      className="w-full p-3 bg-[#0a0a0c] text-[#f5e6c8] placeholder-[#7c7569] text-sm rounded-xl border border-[#24221c] focus:border-[#c9a84c] focus:outline-none resize-none mb-3"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleAddComment(selectedBlog._id)}
                        disabled={isSubmittingComment || !commentText.trim()}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-extrabold text-xs rounded-full hover:brightness-110 transition-all shadow-md disabled:opacity-40"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{isSubmittingComment ? 'Posting...' : 'Post Comment'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3">
                    {selectedBlog.comments && selectedBlog.comments.length > 0 ? (
                      selectedBlog.comments.map((comment, index) => (
                        <div key={index} className="p-3.5 bg-[#18181a] rounded-xl border border-[#24221c]">
                          <p className="text-[#f5e6c8] text-sm leading-relaxed">
                            {comment.content || comment.text || comment.message || comment}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-[#18181a] rounded-xl border border-[#24221c] text-[#7c7569] text-xs">
                        No comments yet. Be the first to comment!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Allblogs;