
import React from 'react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = "Processing YouTube channels..." }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full py-12 animate-fade-in">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 opacity-25"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-youtube border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
      <p className="text-muted-foreground mt-2 animate-pulse-subtle">{message}</p>
    </div>
  );
};

export default LoadingState;
