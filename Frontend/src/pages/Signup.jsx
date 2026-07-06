import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(fullName, username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account');
    }
  };

  return (
    <div className="w-full flex h-screen overflow-hidden bg-background">
      {/* Left Side: Visual/Branding (Hidden on mobile) */}
      <section className="hidden lg:flex w-1/2 relative bg-surface-container-low flex-col justify-between overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 w-full h-full object-cover" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDDaCKk-HnFKrZJM8Yum01dUHH5U7OPaOq7K7fT3iU-JcsXcvnSUcsp2T-NlafL-6ZCVW-uOMoTNUM01W9_KrUg4a8k0pGC7FvGSJTCvWDYWW9ml_UUH-n7Zh831SbJtbfj8_AaCieeDqE_WkztFiOGUWNlHWdx6fXxB45xF_KhKa6PnlCfsQ3rTsBr5jfr-bGajdMLkLfO7qOeZG7AO0fvbTAiiY3iJx8C5EJmUeXQ12jtkn4CTZZjg3-dlHkrxeiMRoqU_vKF9mw')" }}
        ></div>
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent z-10 mix-blend-multiply"></div>
        <div className="relative z-20 p-12 h-full flex flex-col justify-between">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-primary tracking-tight">VibeChat</h1>
          </div>
          <div className="max-w-md">
            <h2 className="font-headline-lg text-[40px] leading-[48px] font-bold text-on-primary mb-6 tracking-tight">Connect with your vibe, instantly.</h2>
            <p className="font-body-lg text-body-lg text-primary-fixed-dim/90 mb-8">Join the community where expression meets speed. High-fidelity communication designed for the modern native.</p>
            {/* Decorative Glass Element */}
            <div className="rounded-xl p-6 flex items-center gap-4 border border-white/20" style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(12px)' }}>
              <div className="flex -space-x-4">
                <img className="w-12 h-12 rounded-full border-2 border-primary-container object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZoaf7jQSRPJMquMxTBN9lKo69FYcnlBBvNdCWWkKgnFF8QCRMbIPh1hhx_cxZDvn9JCeqg0amMKOzCosXXnLauagNfojzfW-Tq9z9XtGbKUP2hsut1GInq4ltHKCwKNYi2DZ3iysIFZjN2W0K3Dkamx_9y_UIVU0vyRJSWzVhnuv9Ysw2ZYaMj6d45HdF6iOqBK5QS5TFfe7-bdv-71UKSqicnns62fXOxY78JvUuhdQRC1Xa4tdh6YDZJUa3uDWpVy8f__vZqNI" alt="User 1" />
                <img className="w-12 h-12 rounded-full border-2 border-primary-container object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXJAFOdUL94cjLf6Y_1eVFywTjOL3yXd0mC6iwR4Z0wqE0pL8-L4-1jZW-35UFMp3ojPIeAfqgS2fAb78IphE08yUPqZrjhUvofOKdYczZNzCOyfhFczzX2SJQJ3FoHSkLog-WbA4vvvyfPvJGWdUG-5J5QkI_ywQJjzO0O96D6VeSMMw3kyv95JESVCHtkQ6KWnz3Qh4YP_QvHBpS-BcUo78LTyBi5k_hrMa-G5TJQKkapmU7X6Ptgm5FFDHMquDHRW2msGJw6pg" alt="User 2" />
                <img className="w-12 h-12 rounded-full border-2 border-primary-container object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG5tBxctK1sh79B1TiLaZMKqEa40_3e8QqgppZIGy7208gnwffVKF_3t3QHE5mSlggy_EtPeUNeihBl5ms8G1J8O-zB_eQmwEd7RHyD2_hvbCf_faBhOcecUpdEEBa5vCHMJIp3BBiDPYTqt1cuoMD7Y_FWcNINVCcm_Wud0b77wRvM3mrBE281Hx8epo7XZJeaWSIrvfl7zeOqvkv-xECXf2-jL9pHz91ta6P5VyDou1SgykFfcGrJkmWUeeyuw60b-jHP6qzqFo" alt="User 3" />
              </div>
              <div className="text-on-primary">
                <p className="font-label-lg text-label-lg">Join 2M+ users</p>
                <p className="font-label-sm text-label-sm text-primary-fixed-dim">Vibing right now</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Right Side: Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface overflow-y-auto z-10 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Brand Header */}
          <div className="lg:hidden mb-12 text-center">
            <h1 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">VibeChat</h1>
          </div>
          
          <div className="text-center lg:text-left">
            <h2 className="font-headline-lg text-[32px] leading-[40px] text-on-surface font-bold tracking-tight mb-2">Create an account</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Start your journey with VibeChat today.</p>
          </div>

          {error && <div className="text-error font-body-md bg-error-container p-3 rounded-lg">{error}</div>}

          <form className="space-y-6 mt-8" onSubmit={handleSubmit}>
            {/* Full Name Input */}
            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface" htmlFor="fullName">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">person</span>
                </div>
                <input 
                  className="block w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-xl text-on-surface font-body-md placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface transition-colors h-[44px] outline-none" 
                  id="fullName" 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Doe" 
                  required 
                />
              </div>
            </div>
            {/* Username Input */}
            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface" htmlFor="username">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">alternate_email</span>
                </div>
                <input 
                  className="block w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-xl text-on-surface font-body-md placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface transition-colors h-[44px] outline-none" 
                  id="username" 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="alexdoe99" 
                  required 
                  minLength={3}
                />
              </div>
            </div>
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">mail</span>
                </div>
                <input 
                  className="block w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-xl text-on-surface font-body-md placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface transition-colors h-[44px] outline-none" 
                  id="email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com" 
                  required 
                />
              </div>
            </div>
            {/* Password Input */}
            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface" htmlFor="password">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">lock</span>
                </div>
                <input 
                  className="block w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-xl text-on-surface font-body-md placeholder:text-outline focus:ring-2 focus:ring-primary focus:bg-surface transition-colors h-[44px] outline-none" 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                  minLength={8}
                />
              </div>
              <p className="font-label-sm text-label-sm text-outline mt-1">Must be at least 8 characters.</p>
            </div>
            {/* Action Button */}
            <button className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/20 text-on-primary bg-primary hover:bg-primary-container font-label-lg text-label-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 active:scale-95 h-[44px]" type="submit">
              Create Account
            </button>
          </form>

          <p className="text-center font-body-md text-body-md text-on-surface-variant mt-8">
            Already have an account? 
            <Link className="font-label-lg text-label-lg text-primary hover:text-primary-container transition-colors ml-1" to="/login">Log in</Link>
          </p>
          <p className="text-center font-label-sm text-label-sm text-outline mt-8 max-w-xs mx-auto">
            By creating an account, you agree to our <a className="underline hover:text-on-surface" href="#">Terms of Service</a> and <a className="underline hover:text-on-surface" href="#">Privacy Policy</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
