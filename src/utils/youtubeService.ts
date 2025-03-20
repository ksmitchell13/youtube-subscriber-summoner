
// This is a mock service since we can't actually call the YouTube API without API keys
// In a real application, you would integrate with the YouTube Data API

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

// Generate monthly data for the past 24 months
const generateMonthlyData = (seed: number): MonthlyPerformance[] => {
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
    
    // Decrease videos and views as we go further back in time (with some randomness)
    const ageMultiplier = Math.max(0.5, 1 - (i * 0.02));
    const randomMultiplier = 0.8 + ((monthSeed % 100) / 100) * 0.4; // 0.8 to 1.2
    
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
    
    monthlyData.push({
      month,
      videoCount: Math.max(1, videoCount),
      views: Math.max(100, views)
    });
  }
  
  return monthlyData.reverse(); // Most recent first
};

// Generate mock data for YouTube channels
const generateMockChannelData = (channelName: string): YouTubeChannelData => {
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
  
  // Subscriber tiers based on seed value
  let subscriberCount, viewCount, videoCount;
  
  if (seed % 100 > 90) {  // 10% chance of being very popular
    subscriberCount = rng(50000000, 10000000);  // 10M - 50M
    viewCount = subscriberCount * rng(100, 40);
    videoCount = rng(5000, 500);
  } else if (seed % 100 > 70) {  // 20% chance of being popular
    subscriberCount = rng(10000000, 1000000);  // 1M - 10M
    viewCount = subscriberCount * rng(80, 30);
    videoCount = rng(2000, 300);
  } else if (seed % 100 > 40) {  // 30% chance of being medium
    subscriberCount = rng(1000000, 100000);  // 100K - 1M
    viewCount = subscriberCount * rng(50, 20);
    videoCount = rng(1000, 100);
  } else {  // 40% chance of being small
    subscriberCount = rng(100000, 1000);  // 1K - 100K
    viewCount = subscriberCount * rng(30, 10);
    videoCount = rng(500, 50);
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
    const viewsPerVideo = Math.floor(subscriberCount * (rng(30, 5) / 100)); // 5-30% of subscribers
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
  
  // Generate monthly performance data
  const monthlyPerformance = generateMonthlyData(seed);
  
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
    monthlyPerformance
  };
};

export const fetchYouTubeChannelData = async (channels: string[]): Promise<YouTubeChannelData[]> => {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return channels.map(generateMockChannelData);
};
