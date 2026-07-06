import React, { useContext } from 'react';
import { CallContext } from '../context/CallContext';

export default function IncomingCallModal() {
  const { isReceivingCall, callerData, callAccepted, answerCall, declineCall } = useContext(CallContext);

  if (!isReceivingCall || callAccepted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-container-high rounded-3xl p-8 max-w-sm w-full mx-4 flex flex-col items-center shadow-2xl border border-surface-variant transform animate-slide-up">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-primary/20 relative">
          <img 
            src={callerData?.avatar || `https://ui-avatars.com/api/?name=${callerData?.name || 'Unknown'}&background=random`} 
            alt={callerData?.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 rounded-full animate-ping border-2 border-primary opacity-75"></div>
        </div>
        
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
          {callerData?.name || 'Incoming Call'}
        </h3>
        <p className="font-body-md text-on-surface-variant mb-8">is video calling you...</p>

        <div className="flex gap-6 w-full justify-center">
          <button 
            onClick={declineCall}
            className="w-16 h-16 rounded-full bg-error flex items-center justify-center text-white hover:bg-error/90 transition-colors shadow-lg active:scale-95"
          >
            <span className="material-symbols-outlined text-[32px]">call_end</span>
          </button>
          <button 
            onClick={answerCall}
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors shadow-lg active:scale-95 animate-pulse"
          >
            <span className="material-symbols-outlined text-[32px]">call</span>
          </button>
        </div>
      </div>
    </div>
  );
}
