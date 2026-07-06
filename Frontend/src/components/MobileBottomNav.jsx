import React from 'react';
import { NavLink } from 'react-router-dom';

export default function MobileBottomNav() {
  return (
    <nav className="h-16 w-full bg-surface-container-lowest border-t border-surface-variant flex items-center justify-around flex-shrink-0 z-20 pb-safe">
      <NavLink 
        to="/"
        className={({ isActive }) => 
          `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-primary' : 'text-on-surface-variant'}`
        }
      >
        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
      </NavLink>

      <button className="flex flex-col items-center justify-center w-full h-full text-on-surface-variant">
        <span className="material-symbols-outlined text-[28px]">search</span>
      </button>

      <NavLink 
        to="/settings"
        className={({ isActive }) => 
          `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-primary' : 'text-on-surface-variant'}`
        }
      >
        <span className="material-symbols-outlined text-[28px]">settings</span>
      </NavLink>
    </nav>
  );
}
