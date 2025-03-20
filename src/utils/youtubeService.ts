
// YouTube Data API Integration
export interface YouTubeVideo {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
}

export interface MonthlyPerformance {
  month: string; // Format: "YYYY-MM"
  videoCount: number;
  views: number;
}

export interface YouTubeChannelData {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnail: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  country: string;
  verified: boolean;
  createdAt: string;
  recentVideos: YouTubeVideo[];
  monthlyPerformance: MonthlyPerformance[];
}

// YouTube API key - in a real production app, this would be stored in environment variables
// This is a placeholder - users will need to replace with their own API key
const YOUTUBE_API_KEY = "YOUR_YOUTUBE_API_KEY";

// Get channel ID from channel name, handle or URL
const getChannelId = async (channelIdentifier: string): Promise<string | null> => {
  try {
    // If it's already a channel ID format
    if (channelIdentifier.startsWith('UC') && channelIdentifier.length > 20) {
      return channelIdentifier;
    }
    
    // Clean up the channel identifier (remove URL parts if present)
    let cleanIdentifier = channelIdentifier
      .replace(/https?:\/\/(www\.)?youtube\.com\/(c\/|channel\/|user\/)?/i, '')
      .replace(/@/g, '')
      .trim();
      
    // If it's a username, channel name, or custom URL, search for it
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      cleanIdentifier
    )}&type=channel&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items[0].snippet.channelId;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting channel ID:", error);
    return null;
  }
};

// Get channel statistics
const getChannelStatistics = async (channelId: string): Promise<any> => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching channel statistics:", error);
    throw error;
  }
};

// Get channel's recent videos
const getChannelVideos = async (channelId: string, maxResults = 10): Promise<any> => {
  try {
    // First get playlist ID for the channel's uploads
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelResponse.json();
    
    if (!channelData.items || channelData.items.length === 0) {
      return [];
    }
    
    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    
    // Then get videos from that playlist
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    );
    const playlistData = await playlistResponse.json();
    
    if (!playlistData.items) {
      return [];
    }
    
    // Get video IDs to fetch statistics
    const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId).join(',');
    
    // Fetch video statistics
    const videoStatsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    const videoStatsData = await videoStatsResponse.json();
    
    // Combine data
    return playlistData.items.map((item: any) => {
      const videoId = item.contentDetails.videoId;
      const stats = videoStatsData.items.find((statItem: any) => statItem.id === videoId)?.statistics || {};
      
      return {
        id: videoId,
        title: item.snippet.title,
        published: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails.medium.url,
        views: parseInt(stats.viewCount || '0'),
        likes: parseInt(stats.likeCount || '0'),
        comments: parseInt(stats.commentCount || '0')
      };
    });
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    return [];
  }
};

// Generate monthly performance data based on videos
const generateMonthlyData = async (channelId: string): Promise<MonthlyPerformance[]> => {
  try {
    // This requires fetching many videos - YouTube API has quotas, so we'll limit this
    // First get playlist ID for the channel's uploads
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelResponse.json();
    
    if (!channelData.items || channelData.items.length === 0) {
      return [];
    }
    
    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    
    // Get more videos (up to 50 is maximum per request)
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
    );
    const playlistData = await playlistResponse.json();
    
    if (!playlistData.items) {
      return [];
    }
    
    // Get video IDs to fetch statistics
    const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId).join(',');
    
    // Fetch video statistics
    const videoStatsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    const videoStatsData = await videoStatsResponse.json();
    
    // Combine and organize by month
    const videosByMonth: Record<string, { videoCount: number; views: number }> = {};
    
    playlistData.items.forEach((item: any) => {
      const videoId = item.contentDetails.videoId;
      const stats = videoStatsData.items.find((statItem: any) => statItem.id === videoId)?.statistics || {};
      const publishDate = new Date(item.snippet.publishedAt);
      const month = `${publishDate.getFullYear()}-${String(publishDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!videosByMonth[month]) {
        videosByMonth[month] = { videoCount: 0, views: 0 };
      }
      
      videosByMonth[month].videoCount += 1;
      videosByMonth[month].views += parseInt(stats.viewCount || '0');
    });
    
    // Convert to array and sort
    return Object.entries(videosByMonth)
      .map(([month, data]) => ({
        month,
        videoCount: data.videoCount,
        views: data.views
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  } catch (error) {
    console.error("Error generating monthly data:", error);
    return [];
  }
};

export const fetchYouTubeChannelData = async (channels: string[]): Promise<YouTubeChannelData[]> => {
  try {
    // Check if API key is set
    if (YOUTUBE_API_KEY === "YOUR_YOUTUBE_API_KEY") {
      throw new Error("YouTube API key not configured. Please update the API key in the code.");
    }
    
    const results: YouTubeChannelData[] = [];
    
    for (const channelIdentifier of channels) {
      const channelId = await getChannelId(channelIdentifier);
      
      if (!channelId) {
        console.error(`Could not find channel ID for: ${channelIdentifier}`);
        continue;
      }
      
      // Get channel statistics
      const channelData = await getChannelStatistics(channelId);
      
      if (!channelData.items || channelData.items.length === 0) {
        console.error(`No data found for channel: ${channelIdentifier}`);
        continue;
      }
      
      const channel = channelData.items[0];
      const snippet = channel.snippet || {};
      const statistics = channel.statistics || {};
      const brandingSettings = channel.brandingSettings || {};
      
      // Get recent videos
      const recentVideos = await getChannelVideos(channelId);
      
      // Generate monthly performance data
      const monthlyPerformance = await generateMonthlyData(channelId);
      
      results.push({
        id: channelId,
        title: snippet.title || channelIdentifier,
        description: snippet.description || "",
        customUrl: snippet.customUrl || `@${snippet.title?.toLowerCase().replace(/\s+/g, '')}`,
        thumbnail: snippet.thumbnails?.high?.url || "",
        subscriberCount: parseInt(statistics.subscriberCount || '0'),
        viewCount: parseInt(statistics.viewCount || '0'),
        videoCount: parseInt(statistics.videoCount || '0'),
        country: snippet.country || brandingSettings.channel?.country || "",
        verified: statistics.subscriberCount > 100000, // Simple verification check
        createdAt: snippet.publishedAt || new Date().toISOString(),
        recentVideos,
        monthlyPerformance
      });
    }
    
    return results;
  } catch (error) {
    console.error("Error fetching YouTube channel data:", error);
    throw error;
  }
};

// Fallback to generate mock data if API key is not set or API errors occur
export const generateMockChannelData = (channelName: string): YouTubeChannelData => {
  // Clean up channel name (remove URL parts if present)
  const cleanName = channelName
    .replace(/https?:\/\/(www\.)?youtube\.com\/(c\/|channel\/|user\/)?/i, '')
    .replace(/@/g, '')
    .trim();
  
  // Generate a consistent ID based on channel name (for demo purposes)
  const channelId = `UC${cleanName.split('').map(c => c.charCodeAt(0)).reduce((a, b) => a + b, 0)}`;
  
  // Generate subscriber count (random but deterministic based on channel name)
  const seed = channelName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const rng = (max: number, min: number = 0) => Math.floor((seed % 100) / 100 * (max - min) + min);
  
  // Add more randomness to make channels look different
  const randomFactor = Math.random() * 3 + 0.5; // A random multiplier between 0.5 and 3.5
  
  // Subscriber tiers based on seed value with added randomness
  let subscriberCount, viewCount, videoCount;
  
  if (seed % 100 > 90) {  // 10% chance of being very popular
    subscriberCount = Math.floor(rng(50000000, 10000000) * randomFactor);  // 10M - 50M
    viewCount = Math.floor(subscriberCount * rng(100, 40) * randomFactor);
    videoCount = Math.floor(rng(5000, 500) * randomFactor);
  } else if (seed % 100 > 70) {  // 20% chance of being popular
    subscriberCount = Math.floor(rng(10000000, 1000000) * randomFactor);  // 1M - 10M
    viewCount = Math.floor(subscriberCount * rng(80, 30) * randomFactor);
    videoCount = Math.floor(rng(2000, 300) * randomFactor);
  } else if (seed % 100 > 40) {  // 30% chance of being medium
    subscriberCount = Math.floor(rng(1000000, 100000) * randomFactor);  // 100K - 1M
    viewCount = Math.floor(subscriberCount * rng(50, 20) * randomFactor);
    videoCount = Math.floor(rng(1000, 100) * randomFactor);
  } else {  // 40% chance of being small
    subscriberCount = Math.floor(rng(100000, 1000) * randomFactor);  // 1K - 100K
    viewCount = Math.floor(subscriberCount * rng(30, 10) * randomFactor);
    videoCount = Math.floor(rng(500, 50) * randomFactor);
  }
  
  // Generate recent videos
  const recentVideos: YouTubeVideo[] = [];
  const videoTitles = [
    `${cleanName}'s Amazing Adventure`,
    `How to Master ${seed % 10 === 0 ? 'Programming' : 'Cooking'} in 10 Days`,
    `My ${seed % 2 === 0 ? 'Morning' : 'Evening'} Routine Revealed`,
    `${seed % 3 === 0 ? 'Unboxing' : 'Review'}: New ${seed % 2 === 0 ? 'iPhone' : 'Samsung'} Model`,
    `${cleanName} Reacts to ${seed % 2 === 0 ? 'Viral Videos' : 'Fan Comments'}`,
    `${cleanName}'s ${seed % 2 === 0 ? 'Q&A' : 'Behind the Scenes'} Session`,
    `Top 10 ${seed % 2 === 0 ? 'Tips' : 'Tricks'} for ${seed % 3 === 0 ? 'Success' : 'Happiness'}`,
    `Why I ${seed % 2 === 0 ? 'Left' : 'Joined'} ${seed % 3 === 0 ? 'YouTube' : 'Social Media'}`,
    `The Truth About ${seed % 2 === 0 ? 'Fame' : 'Money'} on YouTube`,
    `My ${seed % 2 === 0 ? 'First' : 'Last'} Video Got ${rng(10, 1)}M Views`
  ];
  
  for (let i = 0; i < 10; i++) {
    const viewsPerVideo = Math.floor(subscriberCount * (rng(30, 5) / 100) * (Math.random() * 2 + 0.5)); // More randomness
    recentVideos.push({
      id: `video_${i}_${seed % 1000}`,
      title: videoTitles[i],
      published: new Date(Date.now() - i * 1000 * 60 * 60 * 24 * rng(30, 1)).toISOString(),
      thumbnail: `https://picsum.photos/seed/${channelId}_${i}/640/360`,
      views: viewsPerVideo,
      likes: Math.floor(viewsPerVideo * (rng(20, 5) / 100)), // 5-20% like ratio
      comments: Math.floor(viewsPerVideo * (rng(5, 1) / 100)) // 1-5% comment ratio
    });
  }
  
  // Generate monthly performance data with more randomness
  const generateRandomMonthlyData = (): MonthlyPerformance[] => {
    const monthlyData: MonthlyPerformance[] = [];
    const currentDate = new Date();
    
    // Generate data for past 24 months
    for (let i = 0; i < 24; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Use seed to create deterministic but varied data
      const monthSeed = seed + (date.getMonth() * date.getFullYear());
      const rng = (max: number, min: number = 0) => Math.floor((monthSeed % 100) / 100 * (max - min) + min);
      
      // Decrease videos and views as we go further back in time (with more randomness)
      const ageMultiplier = Math.max(0.5, 1 - (i * (0.02 + Math.random() * 0.02)));
      const randomMultiplier = 0.5 + Math.random() * 1.5; // 0.5 to 2.0
      
      let videoCount, views;
      
      if (seed % 100 > 90) {  // Very popular
        videoCount = Math.floor(rng(30, 10) * ageMultiplier * randomMultiplier);
        views = Math.floor(rng(5000000, 1000000) * ageMultiplier * randomMultiplier);
      } else if (seed % 100 > 70) {  // Popular
        videoCount = Math.floor(rng(20, 5) * ageMultiplier * randomMultiplier);
        views = Math.floor(rng(1000000, 200000) * ageMultiplier * randomMultiplier);
      } else if (seed % 100 > 40) {  // Medium
        videoCount = Math.floor(rng(15, 3) * ageMultiplier * randomMultiplier);
        views = Math.floor(rng(200000, 50000) * ageMultiplier * randomMultiplier);
      } else {  // Small
        videoCount = Math.floor(rng(8, 1) * ageMultiplier * randomMultiplier);
        views = Math.floor(rng(50000, 5000) * ageMultiplier * randomMultiplier);
      }
      
      // Add oscillations and spikes for realistic growth patterns
      const trendNoise = Math.sin(i * 0.5) * 0.3 + 1; // Oscillations between 0.7 and 1.3
      const spikeFactor = Math.random() < 0.1 ? Math.random() * 3 + 1 : 1; // 10% chance of a spike
      
      videoCount = Math.floor(videoCount * trendNoise * spikeFactor);
      views = Math.floor(views * trendNoise * spikeFactor);
      
      monthlyData.push({
        month,
        videoCount: Math.max(1, videoCount),
        views: Math.max(100, views)
      });
    }
    
    return monthlyData.reverse(); // Most recent first
  };
  
  return {
    id: channelId,
    title: cleanName,
    description: `This is ${cleanName}'s YouTube channel, featuring videos about ${seed % 2 === 0 ? 'entertainment' : 'education'} and ${seed % 3 === 0 ? 'lifestyle' : 'technology'}.`,
    customUrl: `@${cleanName.toLowerCase().replace(/\s+/g, '')}`,
    thumbnail: `https://picsum.photos/seed/${channelId}/400/400`,
    subscriberCount,
    viewCount,
    videoCount,
    country: ['US', 'UK', 'CA', 'AU', 'IN', 'JP', 'BR', 'DE', 'FR', 'ES'][seed % 10],
    verified: seed % 3 === 0,
    createdAt: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000 * rng(10, 1))).toISOString(),
    recentVideos,
    monthlyPerformance: generateRandomMonthlyData()
  };
};

// Fallback method if API fails
export const getFallbackChannelData = (channels: string[]): YouTubeChannelData[] => {
  return channels.map(generateMockChannelData);
};
