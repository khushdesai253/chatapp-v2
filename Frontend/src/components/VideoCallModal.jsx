import React, { useContext, useEffect, useRef } from 'react';
import { CallContext } from '../context/CallContext';

export default function VideoCallModal() {
  const { 
    callAccepted, 
    callEnded, 
    isCaller, 
    localStream, 
    remoteStream, 
    endCall, 
    toggleVideo, 
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled,
    callerData 
  } = useContext(CallContext);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callAccepted]);

  // Show modal if call is accepted OR if user is the caller waiting for pickup
  if (callEnded || (!callAccepted && !isCaller)) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col animate-fade-in">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <img 
            src={callerData?.avatar || `https://ui-avatars.com/api/?name=${callerData?.name || 'User'}&background=random`} 
            alt="Participant" 
            className="w-10 h-10 rounded-full object-cover border border-white/20"
          />
          <div>
            <h3 className="text-white font-label-lg font-bold">
              {callerData?.name || 'Calling...'}
            </h3>
            <p className="text-white/70 text-xs">
              {callAccepted ? 'Active Call' : 'Ringing...'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-grow relative w-full h-full flex items-center justify-center overflow-hidden">
        
        {/* Remote Video (Full Screen) */}
        {callAccepted ? (
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white/50 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-primary/30 flex items-center justify-center mb-4 relative">
               <img src={callerData?.avatar} className="w-full h-full rounded-full object-cover" />
               <div className="absolute inset-0 rounded-full animate-ping border-2 border-primary"></div>
            </div>
            <p className="text-xl font-headline-sm">Calling {callerData?.name}...</p>
          </div>
        )}

        {/* Local Video (Picture in Picture) */}
        <div className="absolute bottom-24 right-6 w-32 h-48 md:w-48 md:h-64 bg-surface-container-highest rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 z-10 transition-all duration-300 hover:scale-105">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted // ALWAYS mute local video to prevent echo
            className={`w-full h-full object-cover transform scale-x-[-1] ${!isVideoEnabled ? 'opacity-0' : 'opacity-100'}`}
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-container text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px]">videocam_off</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 w-full p-6 flex justify-center items-center gap-6 z-10 bg-gradient-to-t from-black/80 to-transparent">
        <button 
          onClick={toggleAudio}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg backdrop-blur-sm
            ${isAudioEnabled ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white text-black hover:bg-white/90'}`}
        >
          <span className="material-symbols-outlined text-[24px]">
            {isAudioEnabled ? 'mic' : 'mic_off'}
          </span>
        </button>

        <button 
          onClick={endCall}
          className="w-16 h-16 rounded-full bg-error flex items-center justify-center text-white hover:bg-error/90 transition-colors shadow-lg hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-[32px]">call_end</span>
        </button>

        <button 
          onClick={toggleVideo}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg backdrop-blur-sm
            ${isVideoEnabled ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white text-black hover:bg-white/90'}`}
        >
          <span className="material-symbols-outlined text-[24px]">
            {isVideoEnabled ? 'videocam' : 'videocam_off'}
          </span>
        </button>
      </div>
    </div>
  );
}
