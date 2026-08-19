import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Blogcard = ({
  _id,
  image,
  title,
  description,
  tags = [],
  summary = '',
  likes: initialLikes = 0,
  likedBy = [],
  author,
  timestamp,
  onReadMore
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [isLiking, setIsLiking] = useState(false);
  const { username } = useAuth();

  const [isLiked, setIsLiked] = useState(() => {
    return Array.isArray(likedBy) && username ? likedBy.includes(username) : false;
  });

  useEffect(() => {
    setLikes(initialLikes);
  }, [initialLikes]);

  useEffect(() => {
    if (Array.isArray(likedBy) && username) {
      setIsLiked(likedBy.includes(username));
    }
  }, [likedBy, username]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        toggleModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!username) {
      toast.error('Please log in to like posts.');
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    try {
      const response = await fetch(`${(import.meta.env.VITE_BASE_URL || import.meta.env.REACT_APP_BASE_URL || 'http://localhost:5000')}/api/blogs/${_id}/like`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username })
      });

      if (response.ok) {
        const updatedBlog = await response.json();
        setLikes(updatedBlog.likes);
        const userHasLiked = Array.isArray(updatedBlog.likedBy) && updatedBlog.likedBy.includes(username);
        setIsLiked(userHasLiked);
        if (userHasLiked) {
          toast.success('Liked blog post! ❤️');
        } else {
          toast.success('Unliked blog post.');
        }
      } else {
        const errData = await response.json();
        toast.error(errData.error || 'Failed to update like status');
      }
    } catch (error) {
      console.error('Error updating likes:', error);
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <>
      <div className="bg-[#111113] border border-[#24221c] rounded-2xl overflow-hidden hover:border-[#c9a84c]/50 transition-all duration-300 flex flex-col justify-between h-full shadow-lg group hover:shadow-[0_10px_30px_-10px_rgba(201,168,76,0.15)]">
        <div>
          {/* Card Thumbnail */}
          <div className="relative overflow-hidden aspect-video bg-[#0a0a0c]">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:opacity-90"
            />
          </div>

          {/* Card Body */}
          <div className="p-5">
            {/* AI Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#f5e6c8] tracking-wide"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h3 
              onClick={toggleModal}
              className="text-lg font-bold text-[#f5e6c8] mb-2 line-clamp-2 hover:text-[#c9a84c] transition-colors cursor-pointer leading-snug"
            >
              {title}
            </h3>

            {/* Summary Snippet or Description */}
            {summary ? (
              <div className="mb-4 p-3 rounded-xl bg-[#0a0a0c] border border-[#c9a84c]/25">
                <div className="flex items-center text-[11px] font-semibold text-[#c9a84c] mb-1 tracking-wide uppercase">
                  <span>⚡ AI Insight</span>
                </div>
                <p className="text-[#d4c7b5] text-xs line-clamp-2 leading-relaxed">
                  "{summary}"
                </p>
              </div>
            ) : (
              <p className="text-[#9c9486] text-xs mb-4 line-clamp-3 leading-relaxed font-normal">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-5 pt-0">
          <div className="flex items-center justify-between text-xs text-[#9c9486] border-t border-[#24221c] pt-3 mb-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                disabled={isLiking}
                title={isLiked ? "Unlike article" : "Like article"}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full transition-all duration-200 focus:outline-none cursor-pointer ${
                  isLiked
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold'
                    : 'bg-[#18181b] border border-[#27272a] text-[#9c9486] hover:text-[#c9a84c] hover:border-[#c9a84c]/40'
                }`}
                aria-label="Like post"
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isLiked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-[#c9a84c]'
                  }`}
                  fill={isLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={isLiked ? "0" : "2"}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className={`font-semibold ${isLiked ? 'text-rose-300' : 'text-[#f5e6c8]'}`}>
                  {likes}
                </span>
              </button>
            </div>

            <div className="flex items-center space-x-2 text-[11px]">
              <span className="text-[#9c9486]">By <strong className="text-[#f5e6c8] font-medium">{author}</strong></span>
            </div>
          </div>

          <button
            onClick={onReadMore}
            className="w-full bg-[#18181a] hover:bg-[#c9a84c] hover:text-black text-[#f5e6c8] border border-[#24221c] hover:border-[#c9a84c] py-2 rounded-full text-xs font-bold transition-all duration-200"
          >
            Read Article
          </button>
        </div>
      </div>
    </>
  );
};

export default Blogcard;