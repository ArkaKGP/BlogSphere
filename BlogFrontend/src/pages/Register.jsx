import { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Lock, Mail, ArrowRight, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isAnimated, setIsAnimated] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validations, setValidations] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  useEffect(() => {
    setIsAnimated(true);

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time validation
    const newValidations = { ...validations };

    switch (name) {
      case 'username':
        newValidations.username = value.length >= 3;
        break;
      case 'email':
        newValidations.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
      case 'password':
        newValidations.password = value.length >= 8;
        setPasswordStrength(calculatePasswordStrength(value));
        break;
      case 'confirmPassword':
        newValidations.confirmPassword = value === formData.password && value.length > 0;
        break;
    }

    setValidations(newValidations);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-orange-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };


  const handleRegister = async (e) => {
    e.preventDefault();

    // client‑side validation guard
    if (!validations.username || !validations.email ||
      !validations.password || !validations.confirmPassword) {
      return toast.error('Please fix the highlighted errors first.');
    }

    setIsLoading(true);
    try {
      // ② hit the Express route
      const res = await axios.post(`${(import.meta.env.VITE_BASE_URL || import.meta.env.REACT_APP_BASE_URL || 'http://localhost:5000')}/api/auth/register`,
        {
          email: formData.email,
          password: formData.password,
          username: formData.username   // optional, if your schema accepts it
        }
      );
      setFormData({username:'',email:'',confirmPassword:'',password:''})
      // ③ store token & optionally redirect
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({ email: res.data.email }));
      // e.g. navigate('/dashboard');
      toast.success('Registration successful!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0c] text-[#f5e6c8]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Orbs */}
        <div className="absolute top-32 right-20 w-96 h-96 bg-[#c9a84c]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-20 w-96 h-96 bg-[#c9a84c]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className={`w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 transform transition-all duration-1000 ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

          {/* Left Side - Registration Form */}
          <div className="flex items-center justify-center order-2 lg:order-1">
            <div className="w-full max-w-lg">
              {/* Glassmorphism Card */}
              <div className="bg-[#121214] border border-[#24221c] rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-[#dfc067] to-[#c9a84c] rounded-2xl shadow-md shadow-[#c9a84c]/20">
                      <Sparkles className="w-8 h-8 text-black" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-[#f5e6c8]">
                      BlogSphere
                    </h1>
                  </div>
                  <h3 className="text-3xl font-bold text-[#f5e6c8] mb-2">Create Account</h3>
                  <p className="text-[#9c9486] text-sm">Join our community of storytellers</p>
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
                      className="w-full pl-12 pr-12 py-4 bg-[#0a0a0c] border border-[#24221c] rounded-xl text-[#f5e6c8] placeholder-[#7c7569] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all duration-300"
                      placeholder="Choose a username"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      {formData.username && (
                        validations.username ?
                          <CheckCircle className="h-5 w-5 text-emerald-400" /> :
                          <AlertCircle className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-[#9c9486] group-focus-within:text-[#c9a84c] transition-colors duration-300" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-12 py-4 bg-[#0a0a0c] border border-[#24221c] rounded-xl text-[#f5e6c8] placeholder-[#7c7569] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all duration-300"
                      placeholder="Your email address"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      {formData.email && (
                        validations.email ?
                          <CheckCircle className="h-5 w-5 text-emerald-400" /> :
                          <AlertCircle className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
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
                        placeholder="Create a strong password"
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

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#9c9486]">Password strength:</span>
                          <span className={`font-medium ${passwordStrength < 50 ? 'text-red-400' :
                            passwordStrength < 75 ? 'text-yellow-400' : 'text-emerald-400'
                            }`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="w-full bg-[#0a0a0c] rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${passwordStrength}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-[#9c9486] group-focus-within:text-[#c9a84c] transition-colors duration-300" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-12 py-4 bg-[#0a0a0c] border border-[#24221c] rounded-xl text-[#f5e6c8] placeholder-[#7c7569] focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all duration-300"
                      placeholder="Confirm your password"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center space-x-2">
                      {formData.confirmPassword && (
                        validations.confirmPassword ?
                          <CheckCircle className="h-5 w-5 text-emerald-400" /> :
                          <AlertCircle className="h-5 w-5 text-red-400" />
                      )}
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-[#9c9486] hover:text-[#c9a84c] transition-colors duration-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Register Button */}
                  <button
                    type="submit"
                    onClick={handleRegister}
                    disabled={isLoading || Object.values(validations).includes(false)}
                    className="w-full relative bg-gradient-to-r from-[#e5ca7a] via-[#c9a84c] to-[#b8943f] text-black font-extrabold py-4 px-6 rounded-full transition-all duration-300 shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <div className="relative flex items-center justify-center space-x-2">
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </div>
                  </button>

                  {/* Login Link */}
                  <div className="text-center">
                    <p className="text-[#9c9486] text-sm">
                      Already have an account?{' '}
                      <Link to="/login" className="text-[#c9a84c] hover:text-[#f5e6c8] font-bold transition-colors duration-300 hover:underline">
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Welcome Content */}
          <div className="flex flex-col mt-5 items-center text-center lg:text-left space-y-8 order-1 lg:order-2">
            <div className="space-y-6">
              <h2 className="text-5xl lg:text-6xl font-extrabold text-[#f5e6c8] leading-tight">
                Start Your
                <span className="block text-transparent bg-gradient-to-r from-[#f5e6c8] via-[#c9a84c] to-[#e5ca7a] bg-clip-text">
                  Journey
                </span>
              </h2>

              <p className="text-xl text-[#9c9486] max-w-md font-normal">
                Join thousands of writers sharing their stories, experiences, and creativity with the world.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4 w-full max-w-md">
              {[
                { icon: '✍️', title: 'Write & Share', desc: 'Create amazing blog posts' },
                { icon: '🌟', title: 'Get Discovered', desc: 'Reach new audiences' },
                { icon: '💬', title: 'Connect', desc: 'Engage with fellow writers' }
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-[#121214] rounded-2xl border border-[#24221c] transition-all duration-300 group cursor-pointer hover:border-[#c9a84c]/50">
                  <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div className="text-left">
                    <h4 className="text-[#f5e6c8] font-semibold">{feature.title}</h4>
                    <p className="text-[#9c9486] text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;