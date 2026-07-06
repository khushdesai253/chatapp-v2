import React, { useState, useEffect, useContext, useRef } from 'react';
import AppLayout, { useIsMobile } from '../components/AppLayout';
import Sidebar from '../components/Sidebar';
import MobileBottomNav from '../components/MobileBottomNav';
import ChatList from '../components/ChatList';
import MessageList from '../components/MessageList';
import EmptyState from '../components/EmptyState';
import socket from '../services/socket';
import { AuthContext } from '../context/AuthContext';

export default function ChatDashboard() {
  const [activeChat, setActiveChat] = useState(null);
  const [refreshToggle, setRefreshToggle] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useContext(AuthContext);

  const activeChatRef = useRef(activeChat);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    if (!user) return;
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Pass userId as query param and connect socket
    socket.io.opts.query = { userId: user._id };
    socket.connect();

    const handleMessageReceived = (newMessage) => {
      // Play sound if message is not from current user and sound is enabled
      if (newMessage.senderId !== user._id && user.preferences?.soundEnabled !== false) {
        if (user.preferences?.customSoundUrl) {
          const audio = new Audio(user.preferences.customSoundUrl);
          audio.play().catch(e => console.log('Audio play prevented by browser:', e));
        } else {
          // Use native Notification API for system default sound & popup
          if ('Notification' in window && Notification.permission === 'granted') {
            const isActiveChat = activeChatRef.current?.id === newMessage.conversationId;
            if (document.hidden || !isActiveChat) {
              new Notification('New Message', {
                body: newMessage.content,
              });
            }
          } else {
            // Reliable fallback beep using Web Audio API (no external requests needed)
            try {
              const AudioContext = window.AudioContext || window.webkitAudioContext;
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              
              osc.connect(gain);
              gain.connect(ctx.destination);
              
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
              gain.gain.setValueAtTime(0.1, ctx.currentTime); // 10% volume
              
              osc.start();
              gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
              osc.stop(ctx.currentTime + 0.3);
            } catch (e) {
              console.log('Web Audio API error:', e);
            }
          }
        }
      }
    };

    socket.on('message_received', handleMessageReceived);

    return () => {
      socket.off('message_received', handleMessageReceived);
      socket.disconnect();
    };
  }, [user]);

  // Responsive Conditional Rendering
  let mainContent;

  if (isMobile) {
    if (activeChat) {
      // Mobile & Active Chat selected -> Show full screen message list
      mainContent = (
        <MessageList 
          chat={activeChat} 
          onBack={() => setActiveChat(null)} 
          onUpdate={() => setRefreshToggle(prev => !prev)}
        />
      );
    } else {
      // Mobile & No Chat selected -> Show chat list
      mainContent = (
        <ChatList 
          activeChatId={null} 
          onSelectChat={(chat) => setActiveChat(chat)} 
          refreshToggle={refreshToggle} 
        />
      );
    }
  } else {
    // Desktop layout -> Show both panes
    mainContent = (
      <div className="flex h-full w-full">
        <ChatList 
          activeChatId={activeChat?.id} 
          onSelectChat={(chat) => setActiveChat(chat)} 
          refreshToggle={refreshToggle} 
        />
        {activeChat ? (
          <MessageList 
            chat={activeChat} 
            onBack={() => setActiveChat(null)} 
            onUpdate={() => {
              setRefreshToggle(prev => !prev);
              setActiveChat(null); // Assuming delete/clear requires unmounting or we just refresh it. Wait, clear doesn't need unmount.
            }}
            onDelete={() => {
              setRefreshToggle(prev => !prev);
              setActiveChat(null);
            }}
            onClear={() => {
              setRefreshToggle(prev => !prev);
            }}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    );
  }

  return (
    <AppLayout sidebar={Sidebar} bottomNav={MobileBottomNav}>
      {mainContent}
    </AppLayout>
  );
}
