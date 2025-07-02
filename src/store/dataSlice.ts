import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as storage from '../utils/storage';

// Define types for state and payloads as needed
interface SiteData {
  // Define the structure of your site data here
  [key: string]: any;
}

interface DataState {
  site: SiteData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DataState = {
  site: null,
  loading: false,
  error: null,
};

// Async thunk for loading data
export const loadDataThunk = createAsyncThunk<SiteData, void, { rejectValue: string }>(
  'data/loadData',
  async (_, { rejectWithValue }) => {
    try {
      const site = await storage.loadData();
      return site;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    // Add your synchronous reducers here
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
    // Add cases for other thunks as needed
  },
});

export default dataSlice.reducer;
