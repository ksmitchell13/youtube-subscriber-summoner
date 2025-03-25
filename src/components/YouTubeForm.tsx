
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface YouTubeFormProps {
  onSubmit: (channels: string[]) => void;
  isLoading: boolean;
}

const YouTubeForm: React.FC<YouTubeFormProps> = ({ onSubmit, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      toast({
        title: "Input required",
        description: "Please enter at least one YouTube channel",
        variant: "destructive",
      });
      return;
    }
    
    // Split input by new lines, commas, or spaces and filter empty values
    const channels = inputValue
      .split(/[\n,\s]+/)
      .map(channel => channel.trim())
      .filter(channel => channel.length > 0);
    
    if (channels.length === 0) {
      toast({
        title: "Invalid input",
        description: "Please enter valid YouTube channel names or URLs",
        variant: "destructive",
      });
      return;
    }
    
    if (channels.length > 10) {
      toast({
        title: "Too many channels",
        description: "Please limit your request to 10 channels at a time",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit(channels);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto glass-effect animate-slide-up">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center mb-1">
              <div className="h-4 w-4 rounded-full bg-youtube mr-2"></div>
              <p className="text-sm font-medium">Enter YouTube Channels</p>
            </div>
            <Textarea
              placeholder="Enter YouTube channel names or URLs (one per line or comma-separated)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="min-h-24 resize-none bg-background/50 backdrop-blur-sm border-muted focus:border-primary transition-colors"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Example: PewDiePie, https://youtube.com/c/MrBeast, Casey Neistat
            </p>
          </div>
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground hover-effect"
            >
              {isLoading ? 'Processing...' : 'Analyze Channels'}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="pt-0 pb-4">
        <Alert className="w-full">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            This app is now connected to the real YouTube API and will display actual channel data. Mock data will only be used as a fallback if API errors occur.
          </AlertDescription>
        </Alert>
      </CardFooter>
    </Card>
  );
};

export default YouTubeForm;
