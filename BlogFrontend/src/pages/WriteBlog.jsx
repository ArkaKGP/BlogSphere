import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const WriteBlog = () => {
  const { isLoggedIn } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    image: '',
    description: '',
    username: '',
    choice: 'public',
  });
  const [errors, setErrors] = useState({
    title: '',
    image: '',
    description: '',
    author: '',
    username: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { title: '', image: '', description: '', author: '', username: '', };

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Blog description is required';
      isValid = false;
    }
    if (!formData.author.trim()) {
      newErrors.author = 'Author name is required';
      isValid = false;
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }
    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
      isValid = false;
    } else if (!/^https?:\/\/.+$/i.test(formData.image)) {
      newErrors.image = 'Please provide a valid image URL';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for API (matching your backend schema exactly)
      const blogData = {
        title: formData.title.trim(),
        image: formData.image.trim(),
        choice: formData.choice, // 'public' or 'private'
        description: formData.description.trim(),
        author: formData.author.trim(),
        username: formData.username.trim()
      };

      const response = await fetch(`${(import.meta.env.VITE_BASE_URL || import.meta.env.REACT_APP_BASE_URL || 'http://localhost:5000')}/api/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Blog published successfully! 🎉')
        setFormData({
          title: '',
          author: '',
          image: '',
          description: '',
          username: '',
          choice: 'public',
        });
      } else {
        toast.error(`Error: ${result.error || 'Failed to publish blog'}`);
      }
    } catch (error) {
      toast.error('Network error: Unable to publish blog. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-8 relative overflow-hidden text-[#f5e6c8]">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#c9a84c]/10 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#c9a84c]/10 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#dfc067]/10 rounded-full filter blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          {/* Glass morphism container */}
          <div className="backdrop-blur-xl bg-[#121214]/90 rounded-3xl p-12 shadow-2xl border border-[#24221c] transform hover:scale-[1.02] transition-all duration-700 hover:shadow-[#c9a84c]/15">

            {/* Animated title */}
            <div className="mb-8 relative">
              <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#f5e6c8] via-[#c9a84c] to-[#e5ca7a] animate-pulse leading-tight">
                Ready to Share Your Story?
              </h2>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#e5ca7a] to-[#c9a84c] rounded-full animate-pulse"></div>
            </div>

            {/* Subtitle */}
            <p className="text-lg text-[#9c9486] mb-12 font-normal">
              Please{' '}
              <Link
                to="/login"
                className="text-[#c9a84c] hover:text-[#f5e6c8] underline decoration-[#c9a84c] transition-all duration-300 font-semibold"
              >
                Login
              </Link>
              {' '}or{' '}
              <Link
                to="/register"
                className="text-[#c9a84c] hover:text-[#f5e6c8] underline decoration-[#c9a84c] transition-all duration-300 font-semibold"
              >
                Register
              </Link>
              {' '}to start writing your blog
            </p>

            {/* Animated buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-extrabold text-base transition-all hover:brightness-110 shadow-lg shadow-[#c9a84c]/20"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#141416] hover:bg-[#1f1e1b] text-[#f5e6c8] border border-[#24221c] hover:border-[#c9a84c]/40 font-bold text-base transition-all"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0c] text-[#f5e6c8] overflow-hidden py-12">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#c9a84c]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8">
        {/* Animated header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-6xl font-extrabold text-[#f5e6c8] mb-4 tracking-tight">
            Write Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5e6c8] via-[#c9a84c] to-[#e5ca7a]">
              Blog
            </span>
          </h2>

          <p className="text-[#9c9486] text-base sm:text-lg max-w-2xl mx-auto font-normal">
            Share your thoughts and stories with the world. Fill out the form below to create your publication.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-[#121214] p-6 sm:p-10 rounded-3xl shadow-2xl border border-[#24221c] relative overflow-hidden">

            <div className="relative z-10">
              <div className="flex flex-col gap-6">
                
                {/* Title Input */}
                <div>
                  <label htmlFor="title" className="block text-[#f5e6c8] font-semibold text-sm mb-2">
                    Blog Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter your blog title"
                    className="w-full p-4 bg-[#0a0a0c] text-[#f5e6c8] placeholder-[#7c7569] rounded-xl border border-[#24221c] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all"
                    disabled={isSubmitting}
                  />
                  {errors.title && <p className="text-red-400 text-xs mt-2">{errors.title}</p>}
                </div>

                {/* Author Input */}
                <div>
                  <label htmlFor="author" className="block text-[#f5e6c8] font-semibold text-sm mb-2">
                    Author Name *
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Enter author name"
                    className="w-full p-4 bg-[#0a0a0c] text-[#f5e6c8] placeholder-[#7c7569] rounded-xl border border-[#24221c] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all"
                    disabled={isSubmitting}
                  />
                  {errors.author && <p className="text-red-400 text-xs mt-2">{errors.author}</p>}
                </div>

                {/* Username Input */}
                <div>
                  <label htmlFor="username" className="block text-[#f5e6c8] font-semibold text-sm mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className="w-full p-4 bg-[#0a0a0c] text-[#f5e6c8] placeholder-[#7c7569] rounded-xl border border-[#24221c] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all"
                    disabled={isSubmitting}
                  />
                  {errors.username && <p className="text-red-400 text-xs mt-2">{errors.username}</p>}
                </div>

                {/* Image URL Input */}
                <div>
                  <label htmlFor="image" className="block text-[#f5e6c8] font-semibold text-sm mb-2">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="Direct image link (jpg, png, webp)"
                    className="w-full p-4 bg-[#0a0a0c] text-[#f5e6c8] placeholder-[#7c7569] rounded-xl border border-[#24221c] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all"
                    disabled={isSubmitting}
                  />
                  {errors.image && <p className="text-red-400 text-xs mt-2">{errors.image}</p>}
                </div>

                {/* Blog Description Textarea */}
                <div>
                  <label htmlFor="description" className="block text-[#f5e6c8] font-semibold text-sm mb-2">
                    Blog Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Write your blog description here..."
                    rows={6}
                    className="w-full p-4 bg-[#0a0a0c] text-[#f5e6c8] placeholder-[#7c7569] rounded-xl border border-[#24221c] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all resize-none"
                    disabled={isSubmitting}
                  />
                  {errors.description && <p className="text-red-400 text-xs mt-2">{errors.description}</p>}
                </div>

                {/* Privacy Select */}
                <div>
                  <label htmlFor="choice" className="block text-[#f5e6c8] font-semibold text-sm mb-2">
                    Privacy Option
                  </label>
                  <select
                    id="choice"
                    name="choice"
                    value={formData.choice}
                    onChange={handleChange}
                    className="w-full p-4 bg-[#0a0a0c] text-[#f5e6c8] rounded-xl border border-[#24221c] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all cursor-pointer"
                    disabled={isSubmitting}
                  >
                    <option value="public" className="bg-[#121214] text-[#f5e6c8]">🌍 Public - Everyone can view this story</option>
                    <option value="private" className="bg-[#121214] text-[#f5e6c8]">🔒 Private - Only you can view this story</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full p-4 rounded-full font-extrabold text-base mt-4 shadow-lg transition-all ${
                    isSubmitting
                      ? 'bg-[#24221c] text-[#7c7569] cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black hover:brightness-110 shadow-[#c9a84c]/20'
                  }`}
                >
                  {isSubmitting ? 'Publishing...' : '🚀 Publish Story'}
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteBlog;