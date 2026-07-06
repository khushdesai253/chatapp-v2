import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import { AuthContext } from '../context/AuthContext';
import { CallContext } from '../context/CallContext';

export default function MessageList({ chat, onBack, onDelete, onClear }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(chat?.isOnline || false);
  const { user } = useContext(AuthContext);
  const { initiateCall } = useContext(CallContext);

  // Real-time message & typing updates
  useEffect(() => {
    if (!socket || !chat) return;

    setIsOnline(chat.isOnline); // Update state if chat prop changes

    // 1. Fetch initial messages
    const fetchMessages = async () => {
      if (!user) return;
      try {
        const response = await api.get(`/chats/${chat.id}/messages`);
        const formattedMessages = response.data.map(msg => ({
          id: msg._id,
          sender: msg.senderId === user._id ? 'me' : 'them',
          text: msg.content,
          status: msg.status || 'sent',
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(formattedMessages);

        // Mark unread messages from 'them' as read
        const unreadIds = formattedMessages
          .filter(m => m.sender === 'them' && m.status !== 'read')
          .map(m => m.id);
        
        if (unreadIds.length > 0) {
          socket.emit('mark_read', { messageIds: unreadIds, conversationId: chat.id });
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    fetchMessages();

    // 2. Setup socket
    socket.emit('join_chat', chat.id);

    const handleMessageReceived = (newMessage) => {
      if (newMessage.conversationId === chat.id && user) {
        setMessages(prev => [...prev, {
          id: newMessage._id,
          sender: newMessage.senderId === user._id ? 'me' : 'them',
          text: newMessage.content,
          status: newMessage.status || 'sent',
          time: new Date(newMessage.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        // Automatically mark as read if chat is open
        if (newMessage.senderId !== user._id) {
          socket.emit('mark_read', { messageIds: [newMessage._id], conversationId: chat.id });
        }
      }
    };

    const handleChatUpdated = ({ messageIds, status }) => {
      setMessages(prev => prev.map(m => 
        messageIds.includes(m.id) ? { ...m, status } : m
      ));
    };

    socket.on('message_received', handleMessageReceived);
    socket.on('chat_updated', handleChatUpdated);

    const handleTypingStatus = ({ userId, isTyping }) => {
      // Handle typing indicator...
    };

    const handleUserStatusChanged = ({ userId, isOnline: updatedIsOnline }) => {
      if (chat.otherUserId === userId) {
        setIsOnline(updatedIsOnline);
      }
    };
    
    socket.on('typing_status', handleTypingStatus);
    socket.on('user_status_changed', handleUserStatusChanged);

    return () => {
      // socket.emit('leave_chat', chat.id); // Not implemented on backend yet
      socket.off('message_received', handleMessageReceived);
      socket.off('typing_status', handleTypingStatus);
      socket.off('chat_updated', handleChatUpdated);
      socket.off('user_status_changed', handleUserStatusChanged);
    };
  }, [chat]);

  const handleSend = () => {
    if (!inputValue.trim() || !user) return;
    
    // Send via socket (the backend will save and broadcast)
    socket.emit('send_message', { 
      conversationId: chat.id, 
      senderId: user._id,
      content: inputValue,
      messageType: 'text',
      mediaUrl: ''
    });

    setInputValue('');
  };

  const handleDeleteChat = async () => {
    try {
      await api.delete(`/chats/${chat.id}?userId=${user._id}`);
      if (onDelete) onDelete();
    } catch (err) {
      console.error('Error deleting chat:', err);
    }
  };

  const handleClearChat = async () => {
    try {
      await api.delete(`/chats/${chat.id}/clear`);
      setMessages([]);
      if (onClear) onClear();
      setIsMenuOpen(false);
    } catch (err) {
      console.error('Error clearing chat:', err);
    }
  };

  if (!chat) return null;

  return (
    <main className="flex-grow bg-background flex flex-col relative overflow-hidden h-full">
      {/* Header */}
      <header className="h-16 px-4 md:px-6 flex justify-between items-center bg-surface/80 backdrop-blur-md z-10 border-b border-surface-variant shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden p-2 -ml-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <img className="w-10 h-10 rounded-full object-cover" src={chat.avatar} alt={chat.name} />
          <div>
            <div className="font-headline-md text-base md:text-headline-md font-bold text-on-surface">{chat.name}</div>
            <div className={`text-label-sm ${isOnline ? 'text-online-indicator' : 'text-outline-variant'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => initiateCall(chat.otherUserId, { name: chat.name, avatar: chat.avatar, _id: chat.otherUserId })}
            className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">videocam</span>
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">call</span>
          </button>
          
          {/* 3-Dots Menu */}
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-high rounded-xl shadow-lg border border-surface-variant overflow-hidden z-50">
                <div className="py-1">
                  <button className="w-full text-left px-4 py-3 hover:bg-surface-container-highest transition-colors flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">search</span>
                    <span className="font-body-md text-on-surface">Search</span>
                  </button>
                  <button className="w-full text-left px-4 py-3 hover:bg-surface-container-highest transition-colors flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">block</span>
                    <span className="font-body-md text-on-surface">Block</span>
                  </button>
                  <button className="w-full text-left px-4 py-3 hover:bg-surface-container-highest transition-colors flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">notifications_off</span>
                    <span className="font-body-md text-on-surface">Mute Notifications</span>
                  </button>
                  <button className="w-full text-left px-4 py-3 hover:bg-surface-container-highest transition-colors flex items-center gap-3 border-b border-surface-variant">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">download</span>
                    <span className="font-body-md text-on-surface">Export Chat</span>
                  </button>
                  <button onClick={handleClearChat} className="w-full text-left px-4 py-3 hover:bg-surface-container-highest transition-colors flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">mop</span>
                    <span className="font-body-md text-on-surface">Clear Chat</span>
                  </button>
                  <button onClick={handleDeleteChat} className="w-full text-left px-4 py-3 hover:bg-error-container hover:text-error transition-colors flex items-center gap-3 text-error">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                    <span className="font-body-md">Delete Chat</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Click outside overlay */}
            {isMenuOpen && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsMenuOpen(false)}
              ></div>
            )}
          </div>
        </div>
      </header>

      {/* Message Area */}
      <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender === 'me';
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}>
              <div className={`px-4 py-2 max-w-[80%] rounded-2xl ${
                isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-surface-container text-on-surface rounded-bl-sm'
              }`}>
                <p className="font-body-lg text-sm md:text-base">{msg.text}</p>
              </div>
              <div className={`flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'} mt-0.5`}>
                <span className="text-label-sm text-on-surface-variant mx-1">{msg.time}</span>
                {isMe && (
                  <span className={`material-symbols-outlined text-[14px] ${msg.status === 'read' ? 'text-primary' : 'text-outline-variant'}`}>
                    {msg.status === 'sent' ? 'done' : 'done_all'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface shrink-0 border-t border-surface-variant">
        <div className="flex items-end gap-2 bg-surface-container-low rounded-2xl p-2 border border-surface-variant focus-within:border-primary/50 transition-colors">
          <button className="p-2 rounded-full text-outline hover:text-primary transition-colors flex-shrink-0">
            <span className="material-symbols-outlined">add_circle</span>
          </button>
          <textarea 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder="Message..."
            className="flex-grow bg-transparent border-none outline-none resize-none max-h-32 min-h-[40px] py-2 text-on-surface font-body-md placeholder:text-outline-variant scrollbar-hide"
          />
          <button onClick={handleSend} className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors flex-shrink-0">
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </main>
  );
}
