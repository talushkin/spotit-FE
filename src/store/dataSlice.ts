import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as storage from '../utils/storage';
import type { Song } from '../utils/storage';

// Define types for state and payloads as needed
interface SiteData {
  // Define the structure of your site data here
  [key: string]: any;
}

interface DataState {
  site: SiteData | null;
  loading: boolean;
  error: string | null;
  searchOptions?: Song[];
}

const initialState: DataState = {
  site: null,
  loading: false,
  error: null,
  searchOptions: [],
};

// Async thunk for loading data
export const loadDataThunk = createAsyncThunk<any, void, { rejectValue: string }>(
  'data/loadData',
  async (_, { rejectWithValue }) => {
    try {
      const site = await storage.loadData();
      // If the response is wrapped in { site: ... }, return site.site
      if (site && (site as any).site) {
        return (site as any).site;
      }
      return site;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

import { fetchSongsByTitleApi } from '../utils/storage';
// Thunk to fetch songs by title from API (now uses storage.tsx)
export const fetchSongsByTitle = createAsyncThunk<Song[], string, { rejectValue: string }>(
  'data/fetchSongsByTitle',
  async (title, { rejectWithValue }) => {
    console.log('Fetching songs by title:', title);
    try {
      const data = await fetchSongsByTitleApi(title);
      const songNames = data.map((song: Song) => song.title);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'API error');
    }
  }
);

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setSearchOptions: (state, action: PayloadAction<Song[]>) => {
      state.searchOptions = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDataThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDataThunk.fulfilled, (state, action: PayloadAction<SiteData>) => {
        state.site = action.payload;
        state.loading = false;
      })
      .addCase(loadDataThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSongsByTitle.fulfilled, (state, action: PayloadAction<Song[]>) => {
        // Add new API songs to allSongs in state.site
        const fetchedSongs = action.payload;
        console.log('Fetched songs:', fetchedSongs.map((song: Song) => song.title));
        if (fetchedSongs && fetchedSongs.length > 0) {
          state.searchOptions = fetchedSongs;
        }
        state.loading = false;
      });
  },
});

export const { setSearchOptions } = dataSlice.actions;
export default dataSlice.reducer;
// Only export fetchSongsByTitle once (already exported above)
