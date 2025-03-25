
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
  const [apiError, setApiError] = useState<string | null>(null);

  const handleAnalyzeChannels = async (channels: string[]) => {
    try {
      setIsLoading(true);
      setProcessingChannels(channels);
      setApiError(null);
      
      try {
        // Attempt to use the real YouTube API with the provided key
        const data = await fetchYouTubeChannelData(channels);
        setChannelData(data);
        setUseMockData(false);
        
        toast({
          title: "Analysis complete",
          description: `Successfully analyzed ${data.length} channel${data.length !== 1 ? 's' : ''} with real YouTube data`,
        });
      } catch (apiError: any) {
        console.error("YouTube API error:", apiError);
        
        // Extract meaningful error message from API response if available
        let errorMessage = "Using mock data due to API error. Check console for details.";
        
        if (apiError.message && apiError.message.includes("API v3 has not been used")) {
          errorMessage = "YouTube API not enabled. Please visit Google Cloud Console to enable the YouTube Data API v3 for your project.";
          setApiError("The YouTube Data API v3 is not enabled for your API key. Visit https://console.developers.google.com/apis/api/youtube.googleapis.com/overview to enable it for your project.");
        } else if (apiError.message) {
          errorMessage = apiError.message;
          setApiError(apiError.message);
        }
        
        // Fall back to mock data if the API call fails
        const mockData = getFallbackChannelData(channels);
        setChannelData(mockData);
        setUseMockData(true);
        
        toast({
          title: "YouTube API Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
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
    setApiError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <Header />
      
      <main className="container w-full max-w-7xl mt-8 flex-1 flex flex-col items-center">
        {!isLoading && !channelData && (
          <div className="my-8 w-full">
            <YouTubeForm onSubmit={handleAnalyzeChannels} isLoading={isLoading} apiError={apiError} />
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
            apiError={apiError}
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
