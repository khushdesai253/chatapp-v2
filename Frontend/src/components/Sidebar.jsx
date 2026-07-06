import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  return (
    <aside className="h-screen w-20 flex-shrink-0 bg-surface-container-lowest flex flex-col items-center py-6 gap-8 border-r border-surface-variant z-20">
      {/* Brand Logo */}
      <div className="font-headline-lg text-headline-lg font-bold text-primary cursor-pointer">
        V
      </div>

      {/* Navigation Tabs */}
      <nav className="flex flex-col gap-6 flex-grow w-full px-2">
        <NavLink 
          to="/"
          className={({ isActive }) => 
            `group flex flex-col items-center gap-1 p-3 rounded-xl transition-transform duration-150 active:scale-95 ${isActive ? 'text-primary bg-secondary-container/30' : 'text-on-surface-variant hover:bg-surface-container-high transition-colors'}`
          }
        >
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
          <span className="font-label-lg text-label-lg">Chats</span>
        </NavLink>

        <button className="group flex flex-col items-center gap-1 text-on-surface-variant hover:bg-surface-container-high transition-colors p-3 rounded-xl active:scale-95">
          <span className="material-symbols-outlined text-[28px]">search</span>
          <span className="font-label-lg text-label-lg">Search</span>
        </button>

        <NavLink 
          to="/settings"
          className={({ isActive }) => 
            `group flex flex-col items-center gap-1 p-3 rounded-xl transition-transform duration-150 active:scale-95 ${isActive ? 'text-primary bg-secondary-container/30' : 'text-on-surface-variant hover:bg-surface-container-high transition-colors'}`
          }
        >
          <span className="material-symbols-outlined text-[28px]">settings</span>
          <span className="font-label-lg text-label-lg">Settings</span>
        </NavLink>
      </nav>

      {/* User Profile Avatar */}
      <div className="mt-auto relative cursor-pointer active:scale-95 transition-transform">
        <img className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md bg-surface" alt="Profile" src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} />
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-online-indicator rounded-full border-2 border-surface-container-lowest"></div>
      </div>
    </aside>
  );
}
