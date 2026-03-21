import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import authBg from '../assets/images/auth-bg.svg';

const STUDENT_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@(university|univercity)\.com$/;
const VALID_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'STUDENT'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.name.trim()) return 'Full name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (formData.role === 'STUDENT' && !STUDENT_EMAIL_REGEX.test(formData.email.trim())) {
      return 'Students must use a @university.com or @univercity.com email address.';
    }
    if (formData.role === 'TUTOR' && !VALID_EMAIL_REGEX.test(formData.email.trim())) {
      return 'Please enter a valid tutor email address.';
    }
    if (!VALID_EMAIL_REGEX.test(formData.email.trim())) return 'Invalid email format';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const localErr = validateForm();
    if (localErr) {
      setError(localErr);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register({
        ...formData,
        roles: [formData.role]
      });
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      let serverMessage = '';

      if (typeof data === 'string') {
        serverMessage = data;
      } else if (data && typeof data === 'object') {
        if (typeof data.message === 'string' && data.message.trim()) {
          serverMessage = data.message;
        } else {
          serverMessage = Object.values(data).filter(Boolean).join(', ');
        }
      }

      if (!err.response) {
        setError('Cannot connect to server. Please check backend is running on http://localhost:8080.');
      } else if (status === 400) {
        setError(serverMessage || 'Invalid input');
      } else if (status === 409) {
        setError(serverMessage || 'Email already exists');
      } else {
        setError(serverMessage || `Registration failed (HTTP ${status}). Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950 text-white"
      style={{
        backgroundImage: `url(${authBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/40 to-slate-950/70"></div>
      <div className="absolute top-16 right-10 w-80 h-80 rounded-full bg-fuchsia-400/20 blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-10 left-6 w-96 h-96 rounded-full bg-cyan-300/10 blur-3xl animate-pulse delay-700"></div>

      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl p-8 z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-white/90 text-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-lg">
            S
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Register</h2>
          <p className="text-white/70 mt-2">Create your academic support account</p>
        </div>

        {error && (
          <div className="bg-red-500/15 text-red-100 p-4 rounded-xl mb-6 text-sm font-medium border border-red-400/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
            <input
              name="name"
              type="text"
              required
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
            <input
              name="email"
              type="email"
              required
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
              placeholder="name@university.edu"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
            <input
              name="phone"
              type="tel"
              required
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
            <input
              name="password"
              type="password"
              required
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
              className={cn(
                'py-3 px-4 rounded-xl border font-bold transition-all',
                formData.role === 'STUDENT'
                  ? 'bg-white text-slate-900 border-white'
                  : 'bg-white/10 border-white/20 text-white/70 hover:text-white'
              )}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'TUTOR' })}
              className={cn(
                'py-3 px-4 rounded-xl border font-bold transition-all',
                formData.role === 'TUTOR'
                  ? 'bg-white text-slate-900 border-white'
                  : 'bg-white/10 border-white/20 text-white/70 hover:text-white'
              )}
            >
              Tutor
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-slate-900 font-bold py-3 px-4 rounded-xl shadow-lg shadow-black/25 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 hover:-translate-y-0.5"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-white/70">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-white hover:text-white/80 transition-colors">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

// Utility function duplicated for simplicity since tool can't access cn yet
function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

export default Register;
