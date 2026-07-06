import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import { AuthContext } from '../context/AuthContext';

export default function ChatList({ onSelectChat, activeChatId, refreshToggle }) {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useContext(AuthContext);

  // Fetch initial chats & Setup Real-time updates
  useEffect(() => {
    // 1. Fetch initial chat list
    const fetchChats = async () => {
      if (!user) return;
      try {
        const response = await api.get(`/chats?userId=${user._id}`);
        // Map the backend structure to the frontend structure temporarily
        const formattedChats = response.data.map(chat => {
          // Find the other participant
          const otherParticipant = chat.participants.find(p => p._id !== user._id) || chat.participants[0];
          return {
            id: chat._id,
            name: otherParticipant ? otherParticipant.username : 'Unknown',
            time: new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            lastMessage: chat.lastMessage ? chat.lastMessage.content : '',
            avatar: otherParticipant?.avatarUrl || `https://ui-avatars.com/api/?name=${otherParticipant?.name || otherParticipant?.username || 'U'}&background=random`,
            unread: chat.unreadCount || 0,
            isOnline: otherParticipant ? otherParticipant.isOnline : false,
            otherUserId: otherParticipant ? otherParticipant._id : null
          };
        });
        setChats(formattedChats);
      } catch (err) {
        console.error('Error fetching chats:', err);
      }
    };
    fetchChats();

    const handleChatUpdated = (updatedChat) => {
      fetchChats();
    };
    
    const handleNewChat = (newChat) => {
      fetchChats();
    };
    
    const handleMessageReceived = (newMessage) => {
      fetchChats();
    };

    const handleUserStatusChanged = ({ userId, isOnline }) => {
      setChats(prev => prev.map(c => c.otherUserId === userId ? { ...c, isOnline } : c));
    };

    socket.on('chat_updated', handleChatUpdated);
    socket.on('new_chat', handleNewChat);
    socket.on('message_received', handleMessageReceived);
    socket.on('user_status_changed', handleUserStatusChanged);

    return () => {
      socket.off('chat_updated', handleChatUpdated);
      socket.off('new_chat', handleNewChat);
      socket.off('message_received', handleMessageReceived);
      socket.off('user_status_changed', handleUserStatusChanged);
    };
  }, [refreshToggle]);

  // Update browser title with total unread count
  useEffect(() => {
    const totalUnread = chats.reduce((sum, chat) => sum + chat.unread, 0);
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) Messages - ChatApp`;
    } else {
      document.title = 'ChatApp';
    }
  }, [chats]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await api.get(`/users?query=${searchQuery}`);
        // Filter out current user from results
        setSearchResults(response.data.filter(u => u._id !== user._id));
      } catch (err) {
        console.error('Error searching users:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      searchUsers();
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, user._id]);

  const handleStartChat = async (selectedUser) => {
    try {
      const response = await api.post('/chats', {
        participants: [user._id, selectedUser._id]
      });
      
      const newChat = response.data;
      const otherParticipant = newChat.participants.find(p => p._id !== user._id) || newChat.participants[0];
      
      const formattedChat = {
        id: newChat._id,
        name: otherParticipant ? otherParticipant.username : 'Unknown',
        time: new Date(newChat.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lastMessage: newChat.lastMessage ? newChat.lastMessage.content : 'Started a new chat',
        avatar: otherParticipant?.avatarUrl || `https://ui-avatars.com/api/?name=${otherParticipant?.name || otherParticipant?.username || 'U'}&background=random`,
        unread: 0,
        isOnline: otherParticipant ? otherParticipant.isOnline : false,
        otherUserId: otherParticipant ? otherParticipant._id : null
      };

      // Add to local list if not exists
      setChats(prev => {
        if (!prev.find(c => c.id === formattedChat.id)) {
          return [formattedChat, ...prev];
        }
        return prev;
      });

      setSearchQuery('');
      setSearchResults([]);
      onSelectChat(formattedChat);
    } catch (err) {
      console.error('Error starting chat:', err);
    }
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    try {
      await api.delete(`/chats/${chatId}?userId=${user._id}`);
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (activeChatId === chatId) {
        onSelectChat(null);
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
    }
  };

  return (
    <section className="w-full md:w-96 md:border-l md:border-r border-surface-variant bg-surface-container-lowest flex flex-col h-full z-10 flex-shrink-0">
      {/* Sticky Header with Search and Stories */}
      <div className="p-4 bg-surface/80 backdrop-blur-md sticky top-0 z-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-headline-md text-headline-md text-on-surface">Messages</h1>
          <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">edit_square</span>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input 
            className="w-full h-11 bg-surface-low rounded-xl pl-12 pr-10 border-none focus:ring-2 focus:ring-primary/20 font-body-md text-on-surface placeholder:text-outline-variant outline-none" 
            placeholder="Search users..." 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Search Results Dropdown Overlay */}
        {searchQuery.trim() && (
          <div className="absolute left-4 right-4 top-[120px] bg-surface-container-high rounded-xl shadow-lg border border-surface-variant max-h-64 overflow-y-auto z-50">
            {isSearching ? (
              <div className="p-4 text-center text-label-sm text-outline">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map(result => (
                <div 
                  key={result._id} 
                  onClick={() => handleStartChat(result)}
                  className="flex items-center gap-3 p-3 hover:bg-surface-container-highest cursor-pointer border-b border-surface-variant last:border-0 transition-colors"
                >
                  <img src={result.avatarUrl || `https://ui-avatars.com/api/?name=${result.name}&background=random`} alt={result.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface">{result.name}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">@{result.username}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-label-sm text-outline">No users found</div>
            )}
          </div>
        )}

        {/* Horizontal Stories */}
        <div className="flex gap-story-gap overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer">
            <div className="w-[60px] h-[60px] rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center bg-surface-low">
              <span className="material-symbols-outlined text-outline">add</span>
            </div>
            <span className="text-label-sm font-label-sm text-on-surface-variant">Your Story</span>
          </div>
          <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer">
            <div className="active-ring">
              <img className="w-14 h-14 rounded-full object-cover border-2 border-surface-container-lowest" alt="Alex" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3F1PGcKsPxNK1Bc18Bg9EawK0CxjA3llCfvGoqDQMnlHFjfrmGcsdtq7XHuf5NvcwxDrL0e6mZF11Txh0TwncfuNyJ9o4vNhxyQr9AHJH7sdLw9ztgboib9wn_ZM9k3Tn91E2WO2Oph9u4TDFM1fCJKCIGMFcv4zxakk_lkSMp7_lD2TjumcdVNWUttLBFWMmt9mNLIcMrdKqSrQVK5e7dpTIfIe6bOk1yQ1PrpJuuFDEIW0fQiHDH3wMnB6KUh60t9AiH6Oj38s"/>
            </div>
            <span className="text-label-sm font-label-sm text-on-surface">Alex</span>
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-grow overflow-y-auto px-2 pb-6">
        {chats.map(chat => (
          <div 
            key={chat.id} 
            onClick={() => onSelectChat(chat)}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer mb-1 group relative active:scale-95 duration-150 overflow-hidden ${activeChatId === chat.id ? 'bg-surface-container-high' : 'hover:bg-surface-container'}`}
          >
            <div className="relative flex-shrink-0">
              <img className="w-14 h-14 rounded-full object-cover" alt={chat.name} src={chat.avatar}/>
              {chat.isOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-online-indicator rounded-full border-2 border-surface-container-high"></div>
              )}
            </div>
            <div className="flex-grow min-w-0 pr-6">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="font-label-lg text-label-lg text-on-surface truncate">{chat.name}</h3>
                <span className={`text-label-sm font-label-sm ${chat.unread ? 'text-primary' : 'text-outline'}`}>{chat.time}</span>
              </div>
              <p className={`font-body-md text-body-md text-on-surface-variant truncate ${chat.unread ? 'font-bold text-on-surface' : ''}`}>
                {chat.lastMessage}
              </p>
            </div>
            
            {/* Right side interactions: Unread badge */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-end">
              {/* Unread Badge */}
              {chat.unread > 0 && (
                <div className="w-6 h-6 bg-error text-white rounded-full flex items-center justify-center font-bold text-[11px] shadow-sm">
                  {chat.unread}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
