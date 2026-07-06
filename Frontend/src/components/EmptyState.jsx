import React from 'react';

export default function EmptyState() {
  return (
    <main className="flex-grow bg-background flex flex-col relative overflow-hidden h-full w-full hidden md:flex">
      {/* Optional Top Bar */}
      <header className="h-16 px-6 flex justify-between items-center bg-surface/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="font-headline-md text-headline-md font-bold text-on-surface">VibeChat</div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </header>

      {/* Empty State Content */}
      <div className="flex-grow flex flex-col items-center justify-center relative z-10 px-container-margin text-center">
        <div className="w-72 h-72 mb-8 relative">
          <div className="vibe-glass absolute top-0 -left-10 w-48 p-4 rounded-2xl shadow-lg transform -rotate-6 animate-pulse">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary-container/20"></div>
              <div className="h-3 w-20 bg-primary/20 rounded-full"></div>
            </div>
            <div className="h-2 w-full bg-outline-variant/30 rounded-full mb-1"></div>
            <div className="h-2 w-2/3 bg-outline-variant/30 rounded-full"></div>
          </div>
          <div className="vibe-glass absolute bottom-10 -right-10 w-40 p-4 rounded-2xl shadow-xl transform rotate-12">
            <div className="flex justify-end gap-1 mb-2">
              <div className="h-3 w-16 bg-secondary-container/30 rounded-full"></div>
              <div className="w-8 h-8 rounded-full bg-secondary-container/20"></div>
            </div>
            <div className="h-2 w-full bg-outline-variant/30 rounded-full mb-1"></div>
          </div>
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[120px] text-primary/10">forum</span>
          </div>
        </div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Select a vibe to start chatting</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto mb-10">
          Connect with your squad, share stories, and stay in the flow. Your active chats will appear here.
        </p>
        <button className="bg-primary text-white px-8 py-3.5 rounded-full font-label-lg text-label-lg flex items-center gap-2 shadow-lg shadow-primary/30 hover:scale-105 transition-transform active:scale-95">
          <span className="material-symbols-outlined">add_comment</span>
          New Conversation
        </button>
      </div>
      
      {/* FAB for Quick Actions */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/40 hover:rotate-90 transition-transform z-20">
        <span className="material-symbols-outlined text-[32px]">add</span>
      </button>
    </main>
  );
}
