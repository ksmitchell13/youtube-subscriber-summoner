
import React, { useState } from 'react';
import { YouTubeChannelData } from '@/utils/youtubeService';
import ChannelCard from './ChannelCard';
import MonthlyPerformanceChart from './MonthlyPerformanceChart';
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChannelResultsProps {
  results: YouTubeChannelData[];
  onReset: () => void;
  isMockData?: boolean;
  apiError?: string | null;
}

const ChannelResults: React.FC<ChannelResultsProps> = ({ results, onReset, isMockData = false, apiError }) => {
  const [selectedTab, setSelectedTab] = useState<string>("channels");
  
  // Calculate total metrics
  const totalSubscribers = results.reduce((acc, channel) => acc + channel.subscriberCount, 0);
  const totalViews = results.reduce((acc, channel) => acc + channel.viewCount, 0);
  const totalVideos = results.reduce((acc, channel) => acc + channel.videoCount, 0);
  
  // Combine monthly data across all channels
  const combinedMonthlyData = results.reduce((acc, channel) => {
    channel.monthlyPerformance.forEach(monthData => {
      const existingMonth = acc.find(item => item.month === monthData.month);
      if (existingMonth) {
        existingMonth.views += monthData.views;
        existingMonth.videoCount += monthData.videoCount;
      } else {
        acc.push({ ...monthData });
      }
    });
    return acc;
  }, [] as Array<{ month: string; videoCount: number; views: number }>);
  
  // Sort by month (chronological order)
  combinedMonthlyData.sort((a, b) => a.month.localeCompare(b.month));
  
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
      
      {isMockData && (
        <Alert variant="destructive" className="mb-6">
          {apiError ? (
            <>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {apiError}
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Using mock data mode because the API request failed. Check console for more details.
              </AlertDescription>
            </>
          )}
        </Alert>
      )}
      
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
      
      <Tabs defaultValue="channels" className="w-full" onValueChange={setSelectedTab}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
          <TabsTrigger value="channels">Channel Details</TabsTrigger>
          <TabsTrigger value="monthly">Aggregate Monthly Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="channels" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((channel, index) => (
              <ChannelCard key={channel.id} channel={channel} index={index} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="monthly" className="mt-4">
          <MonthlyPerformanceChart data={combinedMonthlyData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChannelResults;
