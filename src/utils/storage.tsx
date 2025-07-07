// Fetch songs by title from API (moved from dataSlice)
export const fetchSongsByTitleApi = async (title: string='movie'): Promise<Song[]> => {
  try {
    const res = await fetch("https://be-tan-theta.vercel.app/api/ai/get-song-list", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 1234",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title })
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    if (Array.isArray(data)) {
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
}



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

