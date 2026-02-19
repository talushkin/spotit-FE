// Fetch songs by title from API (moved from dataSlice)
export const fetchSongsByTitleApi = async (title: string='movie'): Promise<Song[]> => {
  try {
    const res = await fetch("https://be-tan-theta.vercel.app/api/ai/get-song-list", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 1234",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ q:title })
    });
    // Log the raw response object for debugging
    console.log("fetchSongsByTitleApi response:", res);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    if (Array.isArray(data)) {
      // Keep same format: map items and tag genre as 'API'
      console.log("fetchSongsByTitleApi data:", data);
      return data.map((item: any) => ({ ...item, genre: 'API' }));
    }
    return [];
  } catch (err: any) {
    throw new Error(err.message || 'API error');
  }
};

export const fetchPlaylistsByTitleApi = async (title: string='movie'): Promise<Song[]> => {
  try {
    const res = await fetch("https://be-tan-theta.vercel.app/api/ai/get-playlist-list", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 1234",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ q:title })
    });
    // Log the raw response object for debugging
    console.log("fetchSongsByTitleApi response:", res);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    if (Array.isArray(data)) {
      // Keep same format: map items and tag genre as 'API'
      console.log("fetchSongsByTitleApi data:", data);
      return data.map((item: any) => ({ ...item, genre: 'API' }));
    }
    return [];
  } catch (err: any) {
    throw new Error(err.message || 'API error');
  }
};

// utils/storage.ts
import axios from "axios";
import data from "../data/songs.json";

const LOCAL_URL = "http://localhost:5000";
const BASE_URL = "https://be-tan-theta.vercel.app";

const AUTH_HEADER = {
  Authorization: `Bearer 1234`,
};

// --- Types ---


export interface Song {
  _id?: string;
  title: string;
  artist?: string;
  url?: string;
  duration?: string;
  lyrics?: string;
  image?: string;
  imageUrl?: string;
  createdAt?: string;
  genreId?: string;
  genre?: string;
  kar?: boolean;
  vocals?: boolean;
  playedAt?: string;
}

interface PlaylistUser {
  id?: string;
  email?: string;
}

interface PlaylistSnapshot {
  savedAt: string;
  playedAt?: string;
  songs: Song[];
}

export interface PlaylistHistoryEntry {
  id: string;
  playedAt: string;
  songs: Song[];
}

const getUserPlaylistStorageKey = (user?: PlaylistUser) => {
  const identity = user?.id || user?.email || "guest";
  return `spotit.playlist.${identity}`;
};

const LAST_PLAYLIST_STORAGE_KEY = "spotit.playlist.last";
const getUserPlaylistHistoryStorageKey = (user?: PlaylistUser) => {
  const identity = user?.id || user?.email || "guest";
  return `spotit.playlist.history.${identity}`;
};

const LAST_PLAYLIST_HISTORY_STORAGE_KEY = "spotit.playlist.history.last";

export const saveUserPlaylistToLocalStorage = (songs: Song[], user?: PlaylistUser) => {
  if (typeof window === "undefined") return;
  const nowIso = new Date().toISOString();
  const payload: PlaylistSnapshot = {
    savedAt: nowIso,
    playedAt: nowIso,
    songs: Array.isArray(songs) ? songs : [],
  };
  localStorage.setItem(getUserPlaylistStorageKey(user), JSON.stringify(payload));
  localStorage.setItem(LAST_PLAYLIST_STORAGE_KEY, JSON.stringify(payload));
};

export const loadUserPlaylistFromLocalStorage = (user?: PlaylistUser): Song[] => {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(getUserPlaylistStorageKey(user));
  const fallbackRaw = localStorage.getItem(LAST_PLAYLIST_STORAGE_KEY);
  if (!raw && !fallbackRaw) return [];
  try {
    const parsed = JSON.parse(raw || fallbackRaw || "[]") as PlaylistSnapshot | Song[];
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.songs)) return parsed.songs;
    return [];
  } catch {
    try {
      const fallbackParsed = JSON.parse(fallbackRaw || "[]") as PlaylistSnapshot | Song[];
      if (Array.isArray(fallbackParsed)) return fallbackParsed;
      if (fallbackParsed && Array.isArray((fallbackParsed as PlaylistSnapshot).songs)) {
        return (fallbackParsed as PlaylistSnapshot).songs;
      }
      return [];
    } catch {
      return [];
    }
  }
};

export const hasSavedUserPlaylist = (user?: PlaylistUser): boolean => {
  if (typeof window === "undefined") return false;
  const primary = localStorage.getItem(getUserPlaylistStorageKey(user));
  const fallback = localStorage.getItem(LAST_PLAYLIST_STORAGE_KEY);
  return !!(primary || fallback);
};

export const exportPlaylistJsonFile = (songs: Song[], user?: PlaylistUser) => {
  if (typeof window === "undefined") return;
  const identity = user?.id || user?.email || "guest";
  const safeIdentity = identity.replace(/[^a-zA-Z0-9._-]/g, "_");
  const payload = {
    savedAt: new Date().toISOString(),
    user: {
      id: user?.id || null,
      email: user?.email || null,
    },
    songs: Array.isArray(songs) ? songs : [],
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `playlist.${safeIdentity}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export const appendUserPlaylistHistory = (songs: Song[], user?: PlaylistUser) => {
  if (typeof window === "undefined") return;
  if (!Array.isArray(songs) || songs.length === 0) return;

  const entry: PlaylistHistoryEntry = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    playedAt: new Date().toISOString(),
    songs,
  };
  const key = getUserPlaylistHistoryStorageKey(user);
  const next = [entry];
  const serialized = JSON.stringify(next);
  localStorage.setItem(key, serialized);
  localStorage.setItem(LAST_PLAYLIST_HISTORY_STORAGE_KEY, serialized);
};

export const loadUserPlaylistHistory = (user?: PlaylistUser): PlaylistHistoryEntry[] => {
  if (typeof window === "undefined") return [];

  const parseHistory = (raw: string | null): PlaylistHistoryEntry[] => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item) => item && Array.isArray(item.songs) && item.playedAt)
        .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
    } catch {
      return [];
    }
  };

  const primary = parseHistory(localStorage.getItem(getUserPlaylistHistoryStorageKey(user)));
  if (primary.length > 0) return primary;
  return parseHistory(localStorage.getItem(LAST_PLAYLIST_HISTORY_STORAGE_KEY));
};



export enum DisplayType {
  Slider = "slider",
  Circles = "circles",
  Radio = "radio",
  SearchResults = "searchResults",
  Recommended = "recommended",
  ArtistRadio = "artistRadio",
  DailyMix = "dailyMix",
  Trending = "trending",
  DiscoverWeekly = "discoverWeekly",
  RecommendedArtists = "recommendedArtists",
  RadioOfTheDay = "radioOfTheDay",
  TopCharts = "topCharts",
  ThrowbackHits = "throwbackHits"
}

export interface Genre {
  _id?: string;
  genre: string;
  displayType: DisplayType;
  priority?: number;
  createdAt?: string;
  songs: Song[];
}


// Strictly matches the example JSON structure for site data
export interface SiteData {
  site: {
    header: {
      logo: string;
    };
    genres: Genre[];
  };
}

export interface SiteResponse {
  success: boolean;
  message: string;
  site: SiteData;
}

// Load genres and songs from the server
export const loadData = async (loadFromMemory = false): Promise<SiteResponse | { site: { genres: Genre[] } }> => {
  try {
    if (loadFromMemory) {
      const cached = localStorage.getItem("recipeSiteData");
      if (cached) {
        const site = JSON.parse(cached);
        console.log("Loaded site from localStorage cache:", site);
        return site;
      }

    }
    if (data) {
      // Map local data to new Genre/Song structure
      const mappedSite = {
        ...data,
        site: {
          ...data.site,
          genres: (data.site.genres || []).map((cat: any) => ({
            _id: cat._id || cat.category || cat.genre || Math.random().toString(36).slice(2),
            genre: cat.genre || cat.genre || "unknown genre",
            displayType: cat.displayType || "slider",
            priority: cat.priority,
            createdAt: cat.createdAt,
            songs: (cat.songs || cat.itemPage || []).map((song: any) => ({
              _id: song._id || song.title || Math.random().toString(36).slice(2),
              title: song.title,
              artist: song.artist,
              url: song.url,
              duration: song.duration,
              lyrics: song.lyrics,
              imageUrl: song.imageUrl,
              image: song.image,
              createdAt: song.createdAt,
              genreId: song.categoryId || cat._id || cat.category,
              genre: cat.category || cat.genre || "unknown genre",
            }))
          }))
        }
      };
      //console.log("Loaded site from songs.json file (mapped):", mappedSite);
      return mappedSite;
    }
    const genresRes = await axios.get(`${BASE_URL}/api/categories`, {
      headers: AUTH_HEADER,
    });
    const songsRes = await axios.get(`${BASE_URL}/api/recipes`, {
      headers: AUTH_HEADER,
    });
    // Fix: SiteData expects { site: { header, genres } }
    const site: SiteResponse = {
      success: true,
      message: "Data loaded successfully",
      site: {
        site: {
          header: {
            logo: "https://vt-photos.s3.amazonaws.com/recipe-app-icon-generated-image.png"
          },
          genres: genresRes.data.map((genre: any) => ({
            genre: genre.category || "unknown genre",
            // translatedGenre is not in Genre interface, but may exist in data
            // @ts-ignore
            translatedGenre: genre.translatedCategory || [],
            _id: genre._id,
            songs: songsRes.data
              .filter((r: any) => r.categoryId?._id === genre._id)
              .map((r: any) => ({
                title: r.title,
                artist: r.artist,
                url: r.url,
                duration: r.duration,
                lyrics: r.lyrics,
                imageUrl: r.imageUrl,
                image: r.image,
                createdAt: r.createdAt,
                _id: r._id,
                genreId: r.categoryId?._id,
                genre: genre.category || "unknown genre",
              })),
          })),
        }
      },
    } as SiteResponse;
    localStorage.setItem("recipeSiteData", JSON.stringify(site));
    console.log("Data loaded successfully:", site);
    return site;
  } catch (err: any) {
    console.error("Error loading data from API:", err);
    return { site: { genres: [] } };
  }
};

