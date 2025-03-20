
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { YouTubeChannelData } from '@/utils/youtubeService';

interface ChannelCardProps {
  channel: YouTubeChannelData;
  index: number;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const ChannelCard: React.FC<ChannelCardProps> = ({ channel, index }) => {
  // Prepare data for chart
  const videoData = channel.recentVideos.map(video => ({
    name: video.title.substring(0, 20) + (video.title.length > 20 ? '...' : ''),
    views: video.views
  })).slice(0, 5); // Only show top 5 videos
  
  // Calculate engagement rate (average likes per view)
  const engagementRate = channel.recentVideos.length > 0 
    ? (channel.recentVideos.reduce((acc, video) => acc + (video.likes / video.views * 100), 0) / channel.recentVideos.length).toFixed(1) 
    : '0';

  return (
    <Card className={`overflow-hidden glass-effect animate-slide-up`} style={{ animationDelay: `${index * 100}ms` }}>
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <div className="h-14 w-14 overflow-hidden rounded-full border">
          <img 
            src={channel.thumbnail} 
            alt={`${channel.title} thumbnail`} 
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/gray/white?text=YT';
            }}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg line-clamp-1">{channel.title}</h3>
            {channel.verified && (
              <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">✓</div>
            )}
          </div>
          <p className="text-muted-foreground text-sm">{channel.customUrl}</p>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Subscribers</p>
            <p className="text-xl font-bold">{formatNumber(channel.subscriberCount)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Views</p>
            <p className="text-xl font-bold">{formatNumber(channel.viewCount)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Engagement</p>
            <p className="text-xl font-bold">{engagementRate}%</p>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Recent Video Performance</h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={videoData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60} 
                  tick={{ fontSize: 10 }} 
                />
                <YAxis tick={{ fontSize: 10 }} width={40} tickFormatter={formatNumber} />
                <Tooltip 
                  formatter={(value) => [`${formatNumber(value as number)} views`, 'Views']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: 'none'
                  }}
                />
                <Bar dataKey="views" fill="#FF0000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChannelCard;
