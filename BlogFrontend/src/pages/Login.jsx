import React, { useState, useEffect } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, User, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import axios from 'axios';

const Login = () => {
   const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isAnimated, setIsAnimated] = useState(false);
  const { setIsLoggedIn, setUsername, setUser, blogCount, userCount, writerCount } = useAuth();

  useEffect(() => {
    setIsAnimated(true);

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    setFormData({username:'',password:''});

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);


  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${(import.meta.env.VITE_BASE_URL || import.meta.env.REACT_APP_BASE_URL || 'http://localhost:5000')}/api/auth/login`,
        {
          username: formData.username,
          password: formData.password
        }
      );

      const userData = {
        _id: res.data._id,
        username: res.data.username,
        email: res.data.email
      };

      // Store token and user info in localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(userData));

      toast.success('Logged in successfully!');
      setFormData({ username: '', password: '' });

      setIsLoggedIn(true);
      setUser(userData);
      setUsername(res.data.name || res.data.username);

      navigate('/', { replace: true });
    } catch (err) {
      
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0c] text-[#f5e6c8]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#c9a84c]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#c9a84c]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className={`w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 transform transition-all duration-1000 ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

          {/* Left Side - Branding */}
          <div className="flex flex-col justify-center items-center text-center lg:text-left space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <div className="p-3 bg-gradient-to-br from-[#dfc067] to-[#c9a84c] rounded-2xl shadow-md shadow-[#c9a84c]/20">
                  <Sparkles className="w-8 h-8 text-black" />
                </div>
                <h1 className="text-4xl font-extrabold text-[#f5e6c8]">
                  BlogSphere
                </h1>
              </div>

              <h2 className="text-5xl lg:text-6xl font-extrabold text-[#f5e6c8] leading-tight">
                Welcome
                <span className="block text-transparent bg-gradient-to-r from-[#f5e6c8] via-[#c9a84c] to-[#e5ca7a] bg-clip-text">
                  Back
                </span>
              </h2>

              <p className="text-xl text-[#9c9486] max-w-md font-normal">
                Continue your journey of sharing amazing stories and connecting with fellow creators.
              </p>
            </div>

            {/* Animated Stats */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-md">
              {[
                { label: 'Stories', value: blogCount+ ' +'},
                { label: 'Writers', value: writerCount + ' +' },
                { label: 'Readers', value: userCount + ' +'}
              ].map((stat, index) => (
                <div key={index} className="text-center group cursor-pointer bg-[#121214] p-4 rounded-2xl border border-[#24221c]">
                  <div className="text-2xl font-extrabold text-[#f5e6c8] group-hover:text-[#c9a84c] transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="text-[#9c9486] text-xs font-medium mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Glassmorphism Card */}
              <div className="bg-[#121214] border border-[#24221c] rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-[#f5e6c8] mb-2">Sign In</h3>
                  <p className="text-[#9c9486] text-sm">Enter your credentials to continue</p>
                </div>

                <div className="space-y-6">
                  {/* Username Field */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-[#9c9486] group-focus-within:text-[#c9a84c] transition-colors duration-300" />
                    </div>

                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 bg-[#0a0a0c] border border-[#24221c] rounded-xl text-[#f5e6c8] placeholder-[#7c7569] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all duration-300"
                      placeholder="Username"
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-[#9c9486] group-focus-within:text-[#c9a84c] transition-colors duration-300" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-12 py-4 bg-[#0a0a0c] border border-[#24221c] rounded-xl text-[#f5e6c8] placeholder-[#7c7569] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all duration-300"
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9c9486] hover:text-[#c9a84c] transition-colors duration-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    onClick={handleLogin}
                    className="w-full relative bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-extrabold py-4 px-6 rounded-full transition-all duration-300 shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <div className="relative flex items-center justify-center space-x-2">
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </div>
                  </button>

                  {/* Register Link */}
                  <div className="text-center">
                    <p className="text-[#9c9486] text-sm">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-[#c9a84c] hover:text-[#f5e6c8] font-bold transition-colors duration-300 hover:underline">
                        Create one now
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Login;