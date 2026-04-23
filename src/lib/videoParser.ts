// Video URL Parser Utility
// Parses YouTube, Facebook, Instagram, TikTok, and Dailymotion URLs

export type VideoPlatform = 'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'dailymotion';

export interface ParsedVideo {
  url: string;
  platform: VideoPlatform;
  embedId: string;
  thumbnailUrl?: string;
}

export function parseVideoUrl(url: string): ParsedVideo | null {
  if (!url || typeof url !== 'string') return null;

  const trimmedUrl = url.trim();

  // YouTube: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
  const youtubeMatch = trimmedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return {
      url: trimmedUrl,
      platform: 'youtube',
      embedId: videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  // Facebook: https://www.facebook.com/watch?v=VIDEO_ID or https://www.facebook.com/page/videos/ID
  const facebookMatch = trimmedUrl.match(/(?:facebook\.com\/(?:watch\/\?v=|.*\/videos\/|.*\/photos\/))([0-9]+)/);
  if (facebookMatch) {
    return {
      url: trimmedUrl,
      platform: 'facebook',
      embedId: facebookMatch[1],
    };
  }

  // Instagram: https://www.instagram.com/reel/VIDEO_ID or https://www.instagram.com/p/VIDEO_ID
  const instagramMatch = trimmedUrl.match(/(?:instagram\.com\/(?:reel|p)\/)([A-Za-z0-9_-]+)/);
  if (instagramMatch) {
    return {
      url: trimmedUrl,
      platform: 'instagram',
      embedId: instagramMatch[1],
    };
  }

  // TikTok: https://www.tiktok.com/@username/video/VIDEO_ID
  const tiktokMatch = trimmedUrl.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/);
  if (tiktokMatch) {
    return {
      url: trimmedUrl,
      platform: 'tiktok',
      embedId: tiktokMatch[1],
    };
  }

  // Dailymotion: https://www.dailymotion.com/video/VIDEO_ID
  const dailymotionMatch = trimmedUrl.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/);
  if (dailymotionMatch) {
    return {
      url: trimmedUrl,
      platform: 'dailymotion',
      embedId: dailymotionMatch[1],
    };
  }

  return null;
}

// Get embed URL for iframe
export function getEmbedUrl(video: ParsedVideo): string {
  switch (video.platform) {
    case 'youtube':
      return `https://www.youtube.com/embed/${video.embedId}?autoplay=0&rel=0`;
    case 'dailymotion':
      return `https://www.dailymotion.com/embed/video/${video.embedId}`;
    case 'facebook':
      // Facebook doesn't support simple iframe embed, return original URL
      return video.url;
    case 'instagram':
    case 'tiktok':
      // These platforms require special handling or mobile web view
      return video.url;
    default:
      return video.url;
  }
}

// Platform display names
export const PLATFORM_NAMES: Record<VideoPlatform, string> = {
  youtube: 'YouTube',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  dailymotion: 'Dailymotion',
};

// Platform colors
export const PLATFORM_COLORS: Record<VideoPlatform, string> = {
  youtube: '#FF0000',
  facebook: '#1877F2',
  instagram: '#E4405F',
  tiktok: '#000000',
  dailymotion: '#00A0D1',
};

// Check if URL is a supported video platform
export function isSupportedVideoUrl(url: string): boolean {
  return parseVideoUrl(url) !== null;
}

// Validate video URL and return error message if invalid
export function validateVideoUrl(url: string): string | null {
  if (!url || url.trim() === '') return null; // Optional field
  
  const parsed = parseVideoUrl(url);
  if (!parsed) {
    return 'Lien non reconnu. Acceptés : YouTube, Facebook, Instagram, TikTok, Dailymotion';
  }
  return null;
}

export default parseVideoUrl;