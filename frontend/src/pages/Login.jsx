import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2 } from 'lucide-react';
import authBg from '../assets/images/auth-bg.svg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const auth = await login(email, password);
      const role = auth?.user?.role;
      if (role === 'TUTOR') {
        navigate('/support/tutor-dashboard');
      } else {
        navigate('/support');
      }
    } catch (err) {
      if (err.response?.status === 400) {
        // Validation errors from backend
        const validationErrs = err.response.data;
        const msg = Object.values(validationErrs).join(', ');
        setError(msg || 'Invalid input');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-3xl font-bold tracking-tight">Login</h2>
          <p className="text-white/70 mt-2">Access the academic support portal</p>
        </div>

        {error && (
          <div className="bg-red-500/15 text-red-100 p-4 rounded-xl mb-6 text-sm font-medium border border-red-400/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="password"
                required
                className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-white/30 bg-white/10 text-white focus:ring-white/30" />
              <span className="text-sm text-white/70 group-hover:text-white transition-colors">Remember me</span>
            </label>
            <a href="#" className="text-sm font-bold text-white hover:text-white/80">Forgot Password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-slate-900 font-bold py-3 px-4 rounded-xl shadow-lg shadow-black/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 hover:-translate-y-0.5"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8 text-white/70">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-white hover:text-white/80 transition-colors">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
