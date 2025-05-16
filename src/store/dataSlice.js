import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as storage from '../utils/storage';

// Async thunk for loading data
export const loadDataThunk = createAsyncThunk(
  'data/loadData',
  async (_, { rejectWithValue }) => {
    try {
      const site = await storage.loadData();
      return site;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk for adding a category
export const addCategoryThunk = createAsyncThunk(
  'data/addCategory',
  async (categoryName, { rejectWithValue }) => {
    try {
      const res = await storage.addCategory(categoryName);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk for deleting a category
export const delCategoryThunk = createAsyncThunk(
  'data/delCategory',
  async ({ categoryId, categoryName }, { rejectWithValue }) => {
    try {
      await storage.delCategory(categoryId, categoryName);
      return categoryId;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk for reordering categories
export const reorderCategoriesThunk = createAsyncThunk(
  'data/reorderCategories',
  async (orderedCategories, { rejectWithValue }) => {
    try {
      await storage.handleItemsChangeOrder(orderedCategories);
      return orderedCategories;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk for adding a recipe
export const addRecipeThunk = createAsyncThunk(
  'data/addRecipe',
  async ({ recipe, category }, { rejectWithValue }) => {
    try {
      const res = await storage.addRecipe(recipe, category);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk for deleting a recipe
export const delRecipeThunk = createAsyncThunk(
  'data/delRecipe',
  async (recipeId, { rejectWithValue }) => {
    console.log('Deleting recipe with ID:', recipeId);
    try {
      await storage.delRecipe(recipeId);
      return recipeId;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Async thunk for updating a recipe
export const updateRecipeThunk = createAsyncThunk(
  'data/updateRecipe',
  async (updatedRecipe, { rejectWithValue }) => {
    try {
      const res = await storage.updateRecipe(updatedRecipe);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const initialState = {
  site: null,
  loading: false,
  error: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    // Additional synchronous reducers can be declared here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDataThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDataThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.site = action.payload;
      })
      .addCase(loadDataThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addCategoryThunk.fulfilled, (state, action) => {
        if (state.site && state.site.pages) {
          state.site.pages.push(action.payload);
        }
      })
      .addCase(delCategoryThunk.fulfilled, (state, action) => {
        if (state.site && state.site.pages) {
          state.site.pages = state.site.pages.filter(
            (cat) => cat._id !== action.payload
          );
        }
      })
      .addCase(reorderCategoriesThunk.fulfilled, (state, action) => {
        if (state.site && state.site.pages) {
          state.site.pages = action.payload;
        }
      })
      .addCase(addRecipeThunk.fulfilled, (state, action) => {
        // Optionally update state when a new recipe is added.
        // For example, push the new recipe to the appropriate category's itemPage array.
      })
      .addCase(delRecipeThunk.fulfilled, (state, action) => {
        const recipeId = action.payload;
        if (state.site && state.site.pages) {
          state.site.pages = state.site.pages.map((page) => ({
            ...page,
            itemPage: page.itemPage.filter((recipe) => recipe._id !== recipeId)
          }));
        }
      })
      .addCase(updateRecipeThunk.fulfilled, (state, action) => {
        const updatedRecipe = action.payload;
        if (state.site && state.site.pages) {
          state.site.pages = state.site.pages.map((page) => ({
            ...page,
            itemPage: page.itemPage.map((recipe) =>
              recipe._id === updatedRecipe._id ? updatedRecipe : recipe
            )
          }));
        }
      });
  },
});

export default dataSlice.reducer;