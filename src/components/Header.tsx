
import React from 'react';

const Header = () => {
  return (
    <header className="w-full pt-8 pb-6 animate-fade-in">
      <div className="container flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-red-500 to-red-700 p-1 shadow-lg">
            <div className="absolute inset-1/4 h-1/2 w-1/2 rounded-sm bg-white"></div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Channel<span className="text-youtube">Metrics</span>
          </h1>
        </div>
        <p className="max-w-lg text-center text-muted-foreground">
          <span className="chip inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-medium mb-2">Analytics Tool</span>
          <br />
          Track YouTube performance metrics across multiple channels. Get insights on subscribers, views, and engagement.
        </p>
      </div>
    </header>
  );
};

export default Header;
