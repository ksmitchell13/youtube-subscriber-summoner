
import React from 'react';
import { YouTubeChannelData } from '@/utils/youtubeService';
import ChannelCard from './ChannelCard';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

interface ChannelResultsProps {
  results: YouTubeChannelData[];
  onReset: () => void;
}

const ChannelResults: React.FC<ChannelResultsProps> = ({ results, onReset }) => {
  // Calculate total metrics
  const totalSubscribers = results.reduce((acc, channel) => acc + channel.subscriberCount, 0);
  const totalViews = results.reduce((acc, channel) => acc + channel.viewCount, 0);
  const totalVideos = results.reduce((acc, channel) => acc + channel.videoCount, 0);
  
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={onReset} 
          className="hover-effect flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? 'channel' : 'channels'} analyzed
        </div>
      </div>
      
      {results.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 glass-effect p-4 rounded-lg mb-8 animate-slide-down">
          <div className="text-center p-3">
            <p className="text-sm text-muted-foreground">Total Subscribers</p>
            <p className="text-2xl font-bold">{formatNumber(totalSubscribers)}</p>
          </div>
          <div className="text-center p-3">
            <p className="text-sm text-muted-foreground">Total Views</p>
            <p className="text-2xl font-bold">{formatNumber(totalViews)}</p>
          </div>
          <div className="text-center p-3">
            <p className="text-sm text-muted-foreground">Total Videos</p>
            <p className="text-2xl font-bold">{formatNumber(totalVideos)}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.map((channel, index) => (
          <ChannelCard key={channel.id} channel={channel} index={index} />
        ))}
      </div>
    </div>
  );
};

export default ChannelResults;
