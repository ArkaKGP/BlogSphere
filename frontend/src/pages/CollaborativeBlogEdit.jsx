import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CollaborativeEditor from '../components/CollaborativeEditor';
import toast from 'react-hot-toast';
import {
  ShieldAlert, UserPlus, Users, ArrowLeft, Sparkles, CheckCircle2, Lock, Edit3, Save, Check, UserCheck
} from 'lucide-react';

const CollaborativeBlogEdit = () => {
  const { id: blogId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, username: currentUser } = useAuth();

  // Instant fallback for logged in user state from localStorage
  const storedUserStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  let fallbackUsername = '';
  if (storedUserStr) {
    try {
      const u = JSON.parse(storedUserStr);
      fallbackUsername = u.username || u.email || '';
    } catch (e) {}
  }
  const effectiveUsername = currentUser || fallbackUsername;
  const effectiveIsLoggedIn = isLoggedIn || Boolean(localStorage.getItem('token'));

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [collaboratorInput, setCollaboratorInput] = useState('');
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [liveHtml, setLiveHtml] = useState('');

  // Fetch target blog data
  useEffect(() => {
    fetchBlogDetails();
  }, [blogId]);

  const fetchBlogDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || import.meta.env.REACT_APP_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/blogs/${blogId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch blog details');
      }

      setBlog(data);
      setLiveHtml(data.description || '');
    } catch (err) {
      console.error('Error fetching blog:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Explicit Save & Publish handler (Requirement 2)
  const handleSaveBlog = async () => {
    setIsSaving(true);
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || import.meta.env.REACT_APP_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/blogs/${blogId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: liveHtml || blog.description,
        }),
      });

      if (res.ok) {
        toast.success('Blog changes saved & published successfully! 🎉');
      } else {
        toast.error('Failed to save blog changes');
      }
    } catch (err) {
      toast.error('Error saving blog changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Add collaborator by username (Requirement 1 & 3)
  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    if (!collaboratorInput.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setIsAddingCollaborator(true);
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || import.meta.env.REACT_APP_BASE_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      const res = await fetch(`${baseUrl}/api/blogs/${blogId}/collaborators`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ username: collaboratorInput.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`User '${collaboratorInput.trim()}' added & notified! 🎉`);
        setBlog(data);
        setCollaboratorInput('');
      } else {
        toast.error(data.error || 'Failed to add collaborator');
      }
    } catch (err) {
      toast.error('Network error adding collaborator');
    } finally {
      setIsAddingCollaborator(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#0a0a0c]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#24221c] border-t-[#c9a84c] mb-4"></div>
        <p className="text-[#9c9486] font-semibold animate-pulse">
          Loading Collaborative Workspace...
        </p>
      </div>
    );
  }

  // Check login state
  if (!effectiveIsLoggedIn || !effectiveUsername) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-8 text-[#f5e6c8]">
        <div className="max-w-md w-full bg-[#121214] p-8 rounded-3xl border border-[#24221c] text-center shadow-2xl">
          <Lock className="w-16 h-16 text-[#c9a84c] mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-[#9c9486] mb-6">
            Please log in to your account to participate in collaborative blog editing.
          </p>
          <Link
            to="/login"
            className="inline-block w-full py-3.5 bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-extrabold rounded-full hover:brightness-110 transition-all shadow-lg"
          >
            Log In Now
          </Link>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-8 text-[#f5e6c8]">
        <div className="max-w-md w-full bg-[#121214] p-8 rounded-3xl border border-red-500/30 text-center shadow-2xl">
          <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Blog Not Found</h2>
          <p className="text-[#9c9486] mb-6">{error || 'The requested blog does not exist.'}</p>
          <button
            onClick={() => navigate('/myblogs')}
            className="px-6 py-3 bg-[#18181a] border border-[#24221c] text-[#f5e6c8] font-bold rounded-full hover:border-[#c9a84c]"
          >
            Back to My Blogs
          </button>
        </div>
      </div>
    );
  }

  // Access Control Check: User must be author OR listed in collaborators array
  const isAuthor =
    effectiveUsername === blog.username || effectiveUsername === blog.author;
  const isCollaborator =
    Array.isArray(blog.collaborators) && blog.collaborators.includes(effectiveUsername);
  const isAuthorized = isAuthor || isCollaborator;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-8 text-[#f5e6c8]">
        <div className="max-w-lg w-full bg-[#141212] p-10 rounded-3xl border border-red-500/40 text-center shadow-2xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <ShieldAlert className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-red-400 mb-3">Permission Denied</h2>
          <p className="text-[#9c9486] text-base mb-6 leading-relaxed">
            You do not have permission to edit this blog document. Only the original author (<span className="text-[#c9a84c] font-semibold">{blog.username || blog.author}</span>) or authorized collaborators can access this live editor.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/myblogs')}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-extrabold rounded-full hover:brightness-110 transition-all shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to My Blogs</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f5e6c8] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Header with Save Button (Requirement 2) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#24221c]">
          <button
            onClick={() => navigate('/myblogs')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#121214] hover:bg-[#1c1c1f] text-[#9c9486] hover:text-[#f5e6c8] border border-[#24221c] rounded-xl transition-all text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blogs</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/30 rounded-full text-xs font-bold uppercase tracking-wider">
              {isAuthor ? '👑 Owner / Author' : '✍️ Co-Author Collaborator'}
            </span>

            {/* Explicit Save & Publish Button */}
            <button
              onClick={handleSaveBlog}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-extrabold text-sm rounded-full hover:brightness-110 transition-all shadow-lg shadow-[#c9a84c]/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save & Publish Story'}</span>
            </button>
          </div>
        </div>

        {/* Blog Meta Header Card */}
        <div className="bg-[#121214] p-6 sm:p-8 rounded-3xl border border-[#24221c] relative overflow-hidden shadow-xl">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#f5e6c8] mb-2 leading-tight flex items-center gap-3">
                <Edit3 className="w-8 h-8 text-[#c9a84c]" />
                <span>{blog.title}</span>
              </h1>
              <p className="text-[#9c9486] text-sm flex items-center gap-2">
                <span>Original Author:</span>
                <span className="text-[#c9a84c] font-semibold">{blog.username || blog.author}</span>
                <span>•</span>
                <span>Privacy: {blog.choice === 'public' ? '🌍 Public' : '🔒 Private'}</span>
              </p>
            </div>
          </div>

          {/* Redesigned Co-Author Section (Requirement 3) */}
          {isAuthor && (
            <div className="mt-8 pt-6 border-t border-[#24221c] bg-gradient-to-r from-[#161619] via-[#141416] to-[#161619] p-6 rounded-2xl border border-[#c9a84c]/30 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#c9a84c]" />
                  <h3 className="text-base font-bold text-[#f5e6c8]">Co-Author Collaboration Permissions</h3>
                </div>
                <span className="text-xs text-[#9c9486]">Add registered users to edit live with you</span>
              </div>

              <form onSubmit={handleAddCollaborator} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#c9a84c] font-bold text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    placeholder="Enter registered username to invite..."
                    value={collaboratorInput}
                    onChange={(e) => setCollaboratorInput(e.target.value)}
                    disabled={isAddingCollaborator}
                    className="w-full pl-9 pr-4 py-3 bg-[#0a0a0c] text-[#f5e6c8] placeholder-[#7c7569] text-sm rounded-xl border border-[#24221c] focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] focus:outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAddingCollaborator}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-extrabold text-sm rounded-xl hover:brightness-110 transition-all shadow-md shadow-[#c9a84c]/20 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isAddingCollaborator ? 'Inviting...' : '+ Add Co-Author'}</span>
                </button>
              </form>

              {/* List of Allowed Collaborator Pill Badges */}
              {blog.collaborators && blog.collaborators.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#24221c]/60">
                  <p className="text-xs text-[#9c9486] mb-2 font-medium flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#c9a84c]" />
                    Authorized Co-Authors ({blog.collaborators.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {blog.collaborators.map((uname, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#24221c] text-[#c9a84c] rounded-full text-xs font-semibold border border-[#c9a84c]/30 shadow-sm"
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                        @{uname}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-time Collaborative Editor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#f5e6c8] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#c9a84c]" />
              <span>Real-Time Live Canvas</span>
            </h2>
            <div className="flex items-center gap-4">
              <p className="text-xs text-[#9c9486] hidden sm:block">
                All edits sync automatically & auto-save to MongoDB every 3s.
              </p>
              <button
                onClick={handleSaveBlog}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#18181a] border border-[#24221c] hover:border-[#c9a84c] text-[#f5e6c8] font-bold text-xs rounded-lg transition-all"
              >
                <Save className="w-3.5 h-3.5 text-[#c9a84c]" />
                <span>Save Now</span>
              </button>
            </div>
          </div>

          <CollaborativeEditor
            blogId={blogId}
            username={effectiveUsername}
            initialContent={blog.description}
            onSave={(html) => setLiveHtml(html)}
          />
        </div>
      </div>
    </div>
  );
};

export default CollaborativeBlogEdit;
