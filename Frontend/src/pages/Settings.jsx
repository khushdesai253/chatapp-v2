import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useIsMobile } from '../components/AppLayout';

function EditProfileModal({ isOpen, onClose, user, onSave, onUploadDP }) {
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.personalDetails?.location || '');
  const [website, setWebsite] = useState(user?.personalDetails?.website || '');
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      if (selectedFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('userId', user._id);
        formData.append('avatar', selectedFile);
        await onUploadDP(formData);
        setIsUploading(false);
      }

      await onSave({
        userId: user._id,
        name,
        username,
        bio,
        location,
        website
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
      setIsUploading(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-surface-variant flex justify-between items-center">
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Edit Profile</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {error && <div className="mb-4 p-3 bg-error-container text-error rounded-xl font-body-md">{error}</div>}
          
          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <img 
                src={previewImage || user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
                alt="Avatar" 
                className={`w-24 h-24 rounded-full object-cover border-4 border-surface ${isUploading ? 'opacity-50' : 'group-hover:opacity-75 transition-opacity'}`}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white">photo_camera</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
            <p className="text-label-sm text-outline mt-2">Click to change avatar</p>
          </div>

          <form id="profileForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-1">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl h-11 px-4 focus:ring-2 focus:ring-primary outline-none" required />
            </div>
            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-1">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl h-11 px-4 focus:ring-2 focus:ring-primary outline-none" required />
            </div>
            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-1">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows="3" maxLength="160" className="w-full bg-surface-container-low border-none rounded-xl p-4 focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="A little about yourself..."></textarea>
            </div>
            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-1">Location</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl h-11 px-4 focus:ring-2 focus:ring-primary outline-none" placeholder="City, Country" />
            </div>
            <div>
              <label className="block text-label-lg font-bold text-on-surface mb-1">Website</label>
              <input type="url" value={website} onChange={e => setWebsite(e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl h-11 px-4 focus:ring-2 focus:ring-primary outline-none" placeholder="https://example.com" />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-surface-variant flex justify-end gap-3 bg-surface">
          <button onClick={onClose} type="button" className="px-6 py-2 rounded-xl text-on-surface font-label-lg hover:bg-surface-container transition-colors">Cancel</button>
          <button form="profileForm" type="submit" disabled={isSaving} className="px-6 py-2 rounded-xl bg-primary text-white font-label-lg hover:bg-primary-container transition-colors disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const isMobile = useIsMobile();
  const { user, logout, updateProfile, updateDP, updateSound } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const soundInputRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveProfile = async (data) => {
    await updateProfile(data);
  };

  const handleUploadDP = async (formData) => {
    await updateDP(formData);
  };

  const handleSoundChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('userId', user._id);
    formData.append('sound', file);

    try {
      await updateSound(formData);
      alert('Notification sound updated successfully!');
    } catch (err) {
      alert('Failed to upload sound');
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full text-on-surface">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      <main className="flex-1 bg-surface-bright overflow-y-auto relative pb-20 md:pb-0">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md px-4 md:px-8 h-16 flex items-center justify-between border-b border-transparent">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Link to="/" className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors -ml-2">
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
            )}
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Settings & Privacy</h2>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
          {/* Hero Header Section */}
          <section className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8 rounded-3xl bg-primary-container text-on-primary-container shadow-lg relative overflow-hidden">
            {/* Decorative BG */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/20 overflow-hidden flex-shrink-0 bg-surface">
              <img 
                src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="text-center md:text-left z-10 flex-grow">
              <h3 className="font-headline-lg text-headline-lg font-bold">{user?.name}</h3>
              <p className="font-body-md opacity-90 mb-1">@{user?.username} • {user?.email}</p>
              
              {user?.bio && <p className="font-body-md italic opacity-80 max-w-md my-2">{user.bio}</p>}
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                <button onClick={() => setIsEditModalOpen(true)} className="px-5 py-2 bg-white/20 hover:bg-white/30 rounded-full text-label-lg font-bold transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Edit Profile
                </button>
              </div>
            </div>
          </section>

          {/* User Details Grid (If available) */}
          {(user?.personalDetails?.location || user?.personalDetails?.website) && (
            <div className="flex gap-6 p-4 bg-surface-container-low rounded-2xl border border-surface-variant">
              {user.personalDetails.location && (
                <div className="flex items-center gap-2 text-on-surface-variant font-body-md">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  {user.personalDetails.location}
                </div>
              )}
              {user.personalDetails.website && (
                <div className="flex items-center gap-2 text-on-surface-variant font-body-md">
                  <span className="material-symbols-outlined text-[18px]">link</span>
                  <a href={user.personalDetails.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{user.personalDetails.website}</a>
                </div>
              )}
            </div>
          )}

          {/* Bento Grid Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Account Section Card */}
            <div className="md:col-span-2 p-6 rounded-3xl border border-outline-variant shadow-sm flex flex-col gap-6" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
                </div>
                <h4 className="font-headline-md text-headline-md font-bold">Account Settings</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <button className="flex items-center justify-between p-4 rounded-2xl border border-outline-variant hover:bg-surface-container transition-all group">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">key</span>
                    <div className="text-left">
                      <p className="font-label-lg font-bold">Change Password</p>
                      <p className="text-label-sm text-outline">Update your security key</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline">chevron_right</span>
                </button>
                
                <button className="flex items-center justify-between p-4 rounded-2xl border border-outline-variant hover:bg-surface-container transition-all group" onClick={() => soundInputRef.current.click()}>
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">notifications_active</span>
                    <div className="text-left">
                      <p className="font-label-lg font-bold">Custom Notification Sound</p>
                      <p className="text-label-sm text-outline">Upload a custom alert</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline">upload</span>
                </button>
                <input 
                  type="file" 
                  ref={soundInputRef} 
                  className="hidden" 
                  accept="audio/*" 
                  onChange={handleSoundChange}
                />
                
                <button onClick={handleLogout} className="flex items-center justify-between p-4 rounded-2xl border border-error/10 bg-error-container/20 hover:bg-error-container/40 transition-all group">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-error">logout</span>
                    <div className="text-left">
                      <p className="font-label-lg font-bold text-error">Log Out</p>
                      <p className="text-label-sm text-error/70">End your current session</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Help & About Card */}
            <div className="md:col-span-2 p-6 rounded-3xl border border-outline-variant shadow-sm flex flex-col gap-4" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-surface-container-highest text-on-surface flex items-center justify-center">
                  <span className="material-symbols-outlined">help</span>
                </div>
                <h4 className="font-headline-md text-headline-md font-bold">Help & About</h4>
              </div>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="px-6 py-3 bg-surface-container rounded-2xl font-label-lg hover:bg-surface-container-high transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">description</span>
                  Privacy Policy
                </a>
                <a href="#" className="px-6 py-3 bg-surface-container rounded-2xl font-label-lg hover:bg-surface-container-high transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">gavel</span>
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileBottomNav />}

      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        user={user} 
        onSave={handleSaveProfile} 
        onUploadDP={handleUploadDP}
      />
    </div>
  );
}
