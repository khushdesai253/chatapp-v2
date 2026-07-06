import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row bg-background">
      {/* Left Side: Illustration / Branding */}
      <section className="hidden md:flex flex-col w-1/2 h-full bg-primary-container relative overflow-hidden p-12 justify-center items-start text-on-primary-container">
        {/* Decorative background elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-inverse-primary rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="flex items-center space-x-3 mb-8">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
            <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight">VibeChat</h1>
          </div>
          <h2 className="font-headline-lg text-4xl md:text-5xl font-extrabold leading-tight text-white mb-4">
            Connect with your squad
          </h2>
          <p className="font-body-lg text-body-lg text-primary-fixed-dim mb-8">
            High-fidelity communication designed for Gen-Z and young professionals. Fast, fluid, and digitally native.
          </p>
          <div className="w-full h-64 rounded-xl overflow-hidden relative group" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
            <div className="bg-cover bg-center w-full h-full transform group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB12oJQI_ouvV_HFcqAUhpxZGuIchHLFDZZpstAmWBxPBlw8jDuV61kl-3KVSL94YGBO35SEJEFPDUCPVGvGB8PsU8ixaQYuDwBoGYvRiQ6kFzy4qv2mwcDHQyiM6Zzr8V5GegnOpLMr1M1jPxOMXetb2MGj1hATBC3BX-q3nMQM-jkpFT2aiBEbvHBw34ww_3Tlnkt-Zkc_KsjFrkt3P_tSIqvIlJ_kvMh66_Cu8BEeDrixrRvIEEzk8oCvJOvmeaAeHwRzutR290')" }}></div>
          </div>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="w-full md:w-1/2 h-full flex flex-col justify-center px-6 md:px-24 bg-background relative z-10">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden flex items-center space-x-2 mb-12">
          <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
          <h1 className="font-headline-lg text-headline-lg font-bold text-primary">VibeChat</h1>
        </div>
        
        <div className="w-full max-w-md mx-auto space-y-8">
          <div>
            <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-2">Welcome back</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Log in to keep the vibe going.</p>
          </div>
          
          {error && <div className="text-error font-body-md bg-error-container p-3 rounded-lg">{error}</div>}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email/Username Input */}
            <div>
              <label className="block font-label-lg text-label-lg text-on-surface mb-1" htmlFor="email">Email or Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline-variant">person</span>
                </div>
                <input 
                  className="w-full h-11 pl-11 pr-4 bg-surface-container-low border-none rounded-xl font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface transition-colors placeholder:text-outline-variant outline-none" 
                  id="email" 
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@squad.com or username" 
                  required 
                />
              </div>
            </div>
            {/* Password Input */}
            <div>
              <label className="block font-label-lg text-label-lg text-on-surface mb-1" htmlFor="password">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline-variant">lock</span>
                </div>
                <input 
                  className="w-full h-11 pl-11 pr-11 bg-surface-container-low border-none rounded-xl font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface transition-colors placeholder:text-outline-variant outline-none" 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </div>
            {/* Remember & Forgot */}
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center cursor-pointer">
                <input className="w-5 h-5 text-primary bg-surface-container border-none rounded focus:ring-primary transition duration-150 ease-in-out" type="checkbox" />
                <span className="ml-2 font-body-md text-body-md text-on-surface-variant">Remember me</span>
              </label>
              <a className="font-label-lg text-label-lg text-primary hover:text-primary-fixed-dim transition-colors" href="#">Forgot password?</a>
            </div>
            {/* Login Button */}
            <button className="w-full h-12 mt-6 bg-primary text-white font-label-lg text-label-lg rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:bg-primary-container active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2" type="submit">
              <span>Log In</span>
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </form>

          <p className="text-center font-body-md text-body-md text-on-surface-variant mt-8">
            Don't have an account? <Link to="/signup" className="text-primary font-label-lg font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
