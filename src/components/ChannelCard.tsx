
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { YouTubeChannelData } from '@/utils/youtubeService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

// Helper to format month strings into readable format
const formatMonth = (month: string): string => {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
  return date.toLocaleString('default', { month: 'short' });
};

// Generate channel content summary based on channel data
const generateChannelSummary = (channel: YouTubeChannelData) => {
  // This would normally use ML/AI to analyze video content, but for now we'll use channel metadata
  // to make educated guesses about the content
  
  // Determine video style based on channel name and subscriber count
  let videoStyle = "Unknown";
  if (channel.title.toLowerCase().includes("animation") || channel.title.toLowerCase().includes("cartoon")) {
    videoStyle = "Animation";
  } else if (channel.subscriberCount > 1000000) {
    videoStyle = "High production value";
  } else if (channel.subscriberCount > 100000) {
    videoStyle = "Semi-professional";
  } else {
    videoStyle = "Independent creator";
  }
  
  // Determine video types based on channel name and video count
  let videoTypes = [];
  if (channel.title.toLowerCase().includes("podcast") || channel.title.toLowerCase().includes("talk")) {
    videoTypes.push("Podcast/Talk show");
  }
  if (channel.title.toLowerCase().includes("review") || channel.title.toLowerCase().includes("tech")) {
    videoTypes.push("Reviews");
  }
  if (channel.title.toLowerCase().includes("vlog") || channel.title.toLowerCase().includes("daily")) {
    videoTypes.push("Vlogs");
  }
  if (channel.videoCount > 500) {
    videoTypes.push("Regular uploads");
  }
  if (videoTypes.length === 0) {
    videoTypes.push("Mixed content");
  }
  
  // Determine content based on channel name and engagement
  let contentThemes = [];
  const avgLikesPerView = channel.recentVideos.reduce((acc, video) => acc + (video.likes / video.views), 0) / 
                         (channel.recentVideos.length || 1);
  
  if (channel.title.toLowerCase().includes("game") || channel.title.toLowerCase().includes("play")) {
    contentThemes.push("Gaming");
  }
  if (channel.title.toLowerCase().includes("cook") || channel.title.toLowerCase().includes("food")) {
    contentThemes.push("Cooking/Food");
  }
  if (channel.title.toLowerCase().includes("tech") || channel.title.toLowerCase().includes("review")) {
    contentThemes.push("Technology");
  }
  if (channel.title.toLowerCase().includes("beauty") || channel.title.toLowerCase().includes("makeup")) {
    contentThemes.push("Beauty/Fashion");
  }
  if (avgLikesPerView > 0.1) {
    contentThemes.push("Highly engaging");
  }
  if (contentThemes.length === 0) {
    contentThemes.push("General entertainment");
  }
  
  return {
    videoStyle,
    videoTypes: videoTypes.join(", "),
    contentThemes: contentThemes.join(", ")
  };
};

const ChannelCard: React.FC<ChannelCardProps> = ({ channel, index }) => {
  const [selectedChart, setSelectedChart] = useState<string>("videos");
  
  // Prepare data for recent videos chart
  const videoData = channel.recentVideos.map(video => ({
    name: video.title.substring(0, 20) + (video.title.length > 20 ? '...' : ''),
    views: video.views
  })).slice(0, 5); // Only show top 5 videos
  
  // Calculate engagement rate (average likes per view)
  const engagementRate = channel.recentVideos.length > 0 
    ? (channel.recentVideos.reduce((acc, video) => acc + (video.likes / video.views * 100), 0) / channel.recentVideos.length).toFixed(1) 
    : '0';

  // Get monthly data for the last 12 months
  const last12MonthsData = [...channel.monthlyPerformance]
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12)
    .map(month => ({
      ...month,
      formattedMonth: formatMonth(month.month)
    }));
  
  // Generate channel summary
  const summary = generateChannelSummary(channel);

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
        
        <Tabs defaultValue="monthly-views" className="w-full" onValueChange={setSelectedChart}>
          <TabsList className="grid w-full grid-cols-3 mb-3">
            <TabsTrigger value="monthly-views">Monthly Views</TabsTrigger>
            <TabsTrigger value="monthly-videos">Monthly Videos</TabsTrigger>
            <TabsTrigger value="recent">Recent Videos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="monthly-views" className="mt-1">
            <h4 className="text-sm font-medium mb-2">Monthly Views</h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last12MonthsData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                  <XAxis 
                    dataKey="formattedMonth" 
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
          </TabsContent>
          
          <TabsContent value="monthly-videos" className="mt-1">
            <h4 className="text-sm font-medium mb-2">Videos Published</h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last12MonthsData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                  <XAxis 
                    dataKey="formattedMonth" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60} 
                    tick={{ fontSize: 10 }} 
                  />
                  <YAxis tick={{ fontSize: 10 }} width={30} />
                  <Tooltip 
                    formatter={(value) => [`${value} videos`, 'Videos Published']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      border: 'none'
                    }}
                  />
                  <Bar dataKey="videoCount" fill="#4a5568" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="recent" className="mt-1">
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
          </TabsContent>
        </Tabs>
        
        {/* Channel content summary box */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
          <h4 className="text-sm font-medium mb-2">Channel Content Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="font-medium w-32">Video Style:</span>
              <span>{summary.videoStyle}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32">Video Types:</span>
              <span>{summary.videoTypes}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32">Content Themes:</span>
              <span>{summary.contentThemes}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChannelCard;
