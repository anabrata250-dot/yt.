export interface Video {
  id: string;
  youtubeId: string;
  title: string;
  collectionId?: string;
}

export interface Collection {
  id: string;
  name: string;
  createdAt: number;
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
    /(?:youtu\.be\/)([^\?\s]+)/,
    /(?:youtube\.com\/embed\/)([^\?\s]+)/,
    /(?:youtube\.com\/shorts\/)([^\?\s]+)/,
    /(?:youtube\.com\/live\/)([^\?\s]+)/,
    /(?:youtube\.com\/v\/)([^\?\s]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim();
  }
  return null;
}

export function getYouTubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
}
