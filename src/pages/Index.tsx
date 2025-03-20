
import React, { useState } from 'react';
import Header from '@/components/Header';
import YouTubeForm from '@/components/YouTubeForm';
import ChannelResults from '@/components/ChannelResults';
import LoadingState from '@/components/LoadingState';
import { fetchYouTubeChannelData, getFallbackChannelData, YouTubeChannelData } from '@/utils/youtubeService';
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [channelData, setChannelData] = useState<YouTubeChannelData[] | null>(null);
  const [processingChannels, setProcessingChannels] = useState<string[]>([]);
  const [useMockData, setUseMockData] = useState(false);

  const handleAnalyzeChannels = async (channels: string[]) => {
    try {
      setIsLoading(true);
      setProcessingChannels(channels);
      
      let data: YouTubeChannelData[];

      try {
        // Try to use the real YouTube API
        data = await fetchYouTubeChannelData(channels);
        setUseMockData(false);
      } catch (apiError) {
        // If there's an API error (like missing API key), fall back to mock data
        console.error("YouTube API error:", apiError);
        toast({
          title: "YouTube API Error",
          description: (apiError as Error).message || "Falling back to mock data mode",
          variant: "destructive",
        });
        
        data = getFallbackChannelData(channels);
        setUseMockData(true);
      }
      
      setChannelData(data);
      toast({
        title: "Analysis complete",
        description: `Successfully analyzed ${data.length} channel${data.length !== 1 ? 's' : ''}${useMockData ? ' (using mock data)' : ''}`,
      });
    } catch (error) {
      console.error("Error analyzing channels:", error);
      toast({
        title: "Error",
        description: "Failed to analyze YouTube channels. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProcessingChannels([]);
    }
  };

  const handleReset = () => {
    setChannelData(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Header />
      
      <main className="container w-full max-w-7xl mt-8 flex-1 flex flex-col items-center">
        {!isLoading && !channelData && (
          <div className="my-8 w-full">
            <YouTubeForm onSubmit={handleAnalyzeChannels} isLoading={isLoading} />
          </div>
        )}
        
        {isLoading && (
          <LoadingState 
            message="Processing YouTube channel"
            channelCount={processingChannels.length}
          />
        )}
        
        {!isLoading && channelData && (
          <ChannelResults
            results={channelData}
            onReset={handleReset}
            isMockData={useMockData}
          />
        )}
      </main>
      
      <footer className="w-full container max-w-7xl mt-16 text-center text-sm text-muted-foreground">
        <p>Created with precision. {useMockData && "Channel data is simulated for demonstration purposes."}</p>
        <p className="mt-1">© {new Date().getFullYear()} ChannelMetrics</p>
      </footer>
    </div>
  );
};

export default Index;
