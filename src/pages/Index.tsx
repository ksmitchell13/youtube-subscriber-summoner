
import React, { useState } from 'react';
import Header from '@/components/Header';
import YouTubeForm from '@/components/YouTubeForm';
import ChannelResults from '@/components/ChannelResults';
import LoadingState from '@/components/LoadingState';
import { fetchYouTubeChannelData, YouTubeChannelData } from '@/utils/youtubeService';
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [channelData, setChannelData] = useState<YouTubeChannelData[] | null>(null);
  const [processingChannels, setProcessingChannels] = useState<string[]>([]);

  const handleAnalyzeChannels = async (channels: string[]) => {
    try {
      setIsLoading(true);
      setProcessingChannels(channels);
      
      // In a real application, this would call an actual YouTube API
      const data = await fetchYouTubeChannelData(channels);
      
      setChannelData(data);
      toast({
        title: "Analysis complete",
        description: `Successfully analyzed ${data.length} channel${data.length !== 1 ? 's' : ''}`,
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
          <ChannelResults results={channelData} onReset={handleReset} />
        )}
      </main>
      
      <footer className="w-full container max-w-7xl mt-16 text-center text-sm text-muted-foreground">
        <p>Created with precision. Channel data is simulated for demonstration purposes.</p>
        <p className="mt-1">© {new Date().getFullYear()} ChannelMetrics</p>
      </footer>
    </div>
  );
};

export default Index;
