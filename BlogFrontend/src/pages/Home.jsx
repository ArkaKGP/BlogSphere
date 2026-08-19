import React, { useEffect, useState } from 'react';
import Blogcard from '../components/Blogcard';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [blogs, setBlogs] = useState(null);
  const [recommendedBlogs, setRecommendedBlogs] = useState([]);
  const [isRecLoading, setIsRecLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('recommended');
  const [visibleBlogs, setVisibleBlogs] = useState(6);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isLiking, setIsLiking] = useState(false);

  const { username, userCount, setuserCount, blogCount, setblogCount, writerCount, setwriterCount } = useAuth();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(`${(import.meta.env.VITE_BASE_URL || import.meta.env.REACT_APP_BASE_URL || 'http://localhost:5000')}/api/blogs`);
        const json = await response.json();

        if (response.ok) {
          setBlogs(json);
          setblogCount(json.length);
          const uniqueUsernames = new Set(json.map(blog => blog.username));
          setwriterCount(uniqueUsernames.size);
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsRecLoading(true);
      try {
        const queryParam = username ? `?username=${encodeURIComponent(username)}` : '';
        const response = await fetch(`${(import.meta.env.VITE_BASE_URL || import.meta.env.REACT_APP_BASE_URL || 'http://localhost:5000')}/api/blogs/recommendations/for-you${queryParam}`);
        const json = await response.json();
        if (response.ok) {
          setRecommendedBlogs(json);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        setIsRecLoading(false);
      }
    };

    fetchRecommendations();
  }, [username]);

  useEffect(() => {
    const fetchUsernumber = async () => {
      try {
        const response = await fetch(`${(import.meta.env.VITE_BASE_URL || import.meta.env.REACT_APP_BASE_URL || 'http://localhost:5000')}/api/auth/totalusers`);
        const json = await response.json();
        if (response.ok) {
          setuserCount('' + json.totalUsers);
        }
      } catch (err) {
        console.error('Error fetching total users:', err);
      }
    };

    fetchUsernumber();
  }, []);

  const loadMoreBlogs = () => {
    setVisibleBlogs(prev => Math.min(prev + 3, (activeTab === 'recommended' ? recommendedBlogs : blogs)?.length || 0));
  };

  const displayedFeed = activeTab === 'recommended' ? recommendedBlogs : blogs;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f5e6c8]">
      {/* Hero Section */}
      <section className="relative border-b border-[#24221c] bg-gradient-to-b from-[#0a0a0c] via-[#111113] to-[#0a0a0c] py-20 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#c9a84c]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#c9a84c] animate-pulse"></span>
            <span className="text-xs font-semibold text-[#f5e6c8] tracking-wider uppercase">
              {blogs ? `${blogCount}+ Published Stories` : 'AI Powered Publishing'}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#f5e6c8] mb-6 leading-tight">
            Architecting Knowledge through <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5e6c8] via-[#c9a84c] to-[#e5ca7a]">
              Intelligent Stories
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[#9c9486] max-w-2xl mx-auto font-normal leading-relaxed mb-10">
            A high-performance blogging engine equipped with semantic vector search, automated ML summarization, and personalized content recommendation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/writeblog"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-extrabold text-sm transition-all hover:brightness-110 shadow-lg shadow-[#c9a84c]/20"
            >
              Start Writing Story
            </Link>
            <Link
              to="/allblog"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#141416] hover:bg-[#1f1e1b] text-[#f5e6c8] border border-[#24221c] hover:border-[#c9a84c]/40 font-bold text-sm transition-all"
            >
              Explore Vector Search
            </Link>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto border-t border-[#24221c] pt-10 text-center">
            <div className="bg-[#121214] p-4 rounded-2xl border border-[#24221c]">
              <div className="text-3xl font-extrabold text-[#f5e6c8]">{writerCount || 0}+</div>
              <div className="text-xs text-[#9c9486] mt-1 font-medium">Writers</div>
            </div>
            <div className="bg-[#121214] p-4 rounded-2xl border border-[#24221c]">
              <div className="text-3xl font-extrabold text-[#f5e6c8]">{blogCount || 0}+</div>
              <div className="text-xs text-[#9c9486] mt-1 font-medium">Articles</div>
            </div>
            <div className="bg-[#121214] p-4 rounded-2xl border border-[#24221c]">
              <div className="text-3xl font-extrabold text-[#f5e6c8]">{userCount || 0}+</div>
              <div className="text-xs text-[#9c9486] mt-1 font-medium">Readers</div>
            </div>
            <div className="bg-[#121214] p-4 rounded-2xl border border-[#24221c]">
              <div className="text-3xl font-extrabold text-[#c9a84c]">384-d</div>
              <div className="text-xs text-[#9c9486] mt-1 font-medium">Vector Embeddings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Feed Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        {/* Navigation Tabs */}
        <div className="flex flex-col items-center mb-12">
          <div className="inline-flex p-1.5 bg-[#121214] border border-[#24221c] rounded-full mb-4">
            <button
              onClick={() => setActiveTab('recommended')}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'recommended'
                  ? 'bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black shadow-md shadow-[#c9a84c]/20'
                  : 'text-[#9c9486] hover:text-[#f5e6c8]'
              }`}
            >
              ✨ Recommended For You {username && `@${username}`}
            </button>
            <button
              onClick={() => setActiveTab('latest')}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'latest'
                  ? 'bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black shadow-md shadow-[#c9a84c]/20'
                  : 'text-[#9c9486] hover:text-[#f5e6c8]'
              }`}
            >
              🔥 Community Stories
            </button>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#f5e6c8] tracking-tight">
            {activeTab === 'recommended' ? 'Personalized Content Feed' : 'Latest Community Publications'}
          </h2>
        </div>

        {/* Blog Grid */}
        {displayedFeed && displayedFeed.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {displayedFeed.slice(0, visibleBlogs).map((post) => (
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
            <p className="text-base font-medium">No publications available in this feed.</p>
          </div>
        )}

        {displayedFeed && visibleBlogs < displayedFeed.length && (
          <div className="text-center">
            <button
              onClick={loadMoreBlogs}
              className="px-6 py-3 bg-[#141416] hover:bg-[#1f1e1b] border border-[#24221c] hover:border-[#c9a84c]/50 text-[#f5e6c8] rounded-full text-xs font-bold transition-all"
            >
              Load More Publications
            </button>
          </div>
        )}
      </section>

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

              <p className="text-[#d4c7b5] text-base leading-relaxed whitespace-pre-line">
                {selectedBlog.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;