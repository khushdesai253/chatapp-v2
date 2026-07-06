import React, { createContext, useState, useEffect, useRef, useContext } from 'react';
import Peer from 'simple-peer';
import socket from '../services/socket';
import { AuthContext } from './AuthContext';

export const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [callState, setCallState] = useState({
    isReceivingCall: false,
    callerData: null,
    room: null,
    callAccepted: false,
    callEnded: false,
    isCaller: false,
    remoteStream: null,
  });

  const [localStream, setLocalStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  
  const connectionRef = useRef();

  // Socket listeners for WebRTC Signaling
  useEffect(() => {
    if (!user) return;

    const handleIncomingCall = ({ room, callerData }) => {
      setCallState((prev) => ({
        ...prev,
        isReceivingCall: true,
        callerData,
        room,
      }));
    };

    const handleCallEnded = () => {
      endCall();
    };

    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_ended', handleCallEnded);

    return () => {
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_ended', handleCallEnded);
    };
  }, [user]);

  // Request Media Permissions
  const getMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Failed to get local stream', err);
      return null;
    }
  };

  // 1. Caller initiates the call
  const initiateCall = async (recipientId, recipientData) => {
    const stream = await getMediaStream();
    if (!stream) return;

    // Room ID can just be callerId-recipientId
    const room = `${user._id}-${recipientId}-${Date.now()}`;
    
    setCallState((prev) => ({
      ...prev,
      isCaller: true,
      room,
      callerData: recipientData, // Store recipient data as 'callerData' to display in the modal
      callAccepted: false,
      callEnded: false,
    }));

    socket.emit('initiate_call', {
      room,
      callerData: {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatarUrl,
      },
      recipientId,
    });

    let peer = null;

    const handleWebRTCSignaling = ({ signalData }) => {
      if (peer) {
        peer.signal(signalData);
      }
    };

    const handleCallResponse = ({ accepted }) => {
      if (!accepted) {
        endCall();
        alert('Call was declined.');
      } else {
        setCallState((prev) => ({ ...prev, callAccepted: true }));
        
        // ONLY create the Peer and start signaling AFTER the receiver has accepted and joined the room!
        peer = new Peer({
          initiator: true,
          trickle: false,
          stream: stream,
        });

        peer.on('signal', (data) => {
          console.log('Caller emitting signal', data.type);
          socket.emit('webrtc_signaling', { room, signalData: data });
        });

        peer.on('connect', () => {
          console.log('Caller Peer connected!');
        });

        peer.on('error', (err) => {
          console.error('Caller Peer error:', err);
        });

        peer.on('stream', (currentStream) => {
          console.log('Caller received remote stream', currentStream);
          setCallState((prev) => ({ ...prev, remoteStream: currentStream }));
        });

        connectionRef.current = peer;

        // Re-attach teardown to peer instance for easy cleanup
        connectionRef.current.cleanupListeners = () => {
          socket.off('call_response', handleCallResponse);
          socket.off('webrtc_signaling', handleWebRTCSignaling);
        };
      }
    };

    socket.on('call_response', handleCallResponse);
    socket.on('webrtc_signaling', handleWebRTCSignaling);

    // Provide a dummy connectionRef temporarily just to hold the cleanup listeners
    // until the actual Peer connection is created
    connectionRef.current = {
      cleanupListeners: () => {
        socket.off('call_response', handleCallResponse);
        socket.off('webrtc_signaling', handleWebRTCSignaling);
      }
    };
  };

  // 2. Receiver answers the call
  const answerCall = async () => {
    const stream = await getMediaStream();
    if (!stream) {
      declineCall();
      return;
    }

    setCallState((prev) => ({ ...prev, callAccepted: true, isReceivingCall: false }));

    socket.emit('call_response', { callerId: callState.callerData._id, accepted: true, room: callState.room });

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on('signal', (data) => {
      console.log('Receiver emitting signal', data.type);
      socket.emit('webrtc_signaling', { room: callState.room, signalData: data });
    });

    peer.on('connect', () => {
      console.log('Receiver Peer connected!');
    });

    peer.on('error', (err) => {
      console.error('Receiver Peer error:', err);
    });

    peer.on('stream', (currentStream) => {
      console.log('Receiver received remote stream', currentStream);
      setCallState((prev) => ({ ...prev, remoteStream: currentStream }));
    });

    const handleWebRTCSignaling = ({ signalData }) => {
      peer.signal(signalData);
    };

    socket.on('webrtc_signaling', handleWebRTCSignaling);

    connectionRef.current = peer;
    connectionRef.current.cleanupListeners = () => {
      socket.off('webrtc_signaling', handleWebRTCSignaling);
    };
  };

  // 3. Receiver declines the call
  const declineCall = () => {
    socket.emit('call_response', { callerId: callState.callerData._id, accepted: false });
    resetCallState();
  };

  // 4. Hang up the call
  const endCall = () => {
    if (callState.room) {
      socket.emit('end_call', { room: callState.room });
    }
    resetCallState();
  };

  const resetCallState = () => {
    if (connectionRef.current) {
      if (connectionRef.current.cleanupListeners) connectionRef.current.cleanupListeners();
      if (typeof connectionRef.current.destroy === 'function') connectionRef.current.destroy();
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    
    setCallState({
      isReceivingCall: false,
      callerData: null,
      room: null,
      callAccepted: false,
      callEnded: true,
      isCaller: false,
      remoteStream: null,
    });
    setLocalStream(null);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  return (
    <CallContext.Provider
      value={{
        ...callState,
        localStream,
        isVideoEnabled,
        isAudioEnabled,
        initiateCall,
        answerCall,
        declineCall,
        endCall,
        toggleVideo,
        toggleAudio,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
