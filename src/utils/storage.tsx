// utils/storage.ts
import axios from "axios";
import data from "../data/recipes.json";

const LOCAL_URL = "http://localhost:5000";
const BASE_URL = "https://be-tan-theta.vercel.app";

const AUTH_HEADER = {
  Authorization: `Bearer 1234`,
};

// --- Types ---
export interface Recipe {
  _id?: string;
  title: string;
  ingredients?: string; // optional for music
  preparation?: string; // optional for music
  imageUrl?: string;
  image?: string; // for compatibility with JSON data
  createdAt?: string;
  categoryId?: string;
  category?: string;
  artist?: string;
  url?: string;
  lyrics?: string;
  duration?: string;
}

export interface Category {
  _id: string;
  category: string;
  translatedCategory?: string[];
  itemPage: Recipe[];
}

export interface SiteData {
  header: { logo: string };
  pages: Category[];
}

export interface SiteResponse {
  success: boolean;
  message: string;
  site: SiteData;
}

// Load categories and recipes from the server
export const loadData = async (loadFromMemory = false): Promise<SiteResponse | { site: { pages: Category[] } }> => {
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
        const site = data;
        console.log("Loaded site from songs.json file:", site);
        return site;
      }
    const categoriesRes = await axios.get(`${BASE_URL}/api/categories`, {
      headers: AUTH_HEADER,
    });
    const recipesRes = await axios.get(`${BASE_URL}/api/recipes`, {
      headers: AUTH_HEADER,
    });
    const site: SiteResponse = {
      success: true,
      message: "Data loaded successfully",
      site: {
        header: {
          logo: "https://vt-photos.s3.amazonaws.com/recipe-app-icon-generated-image.png"
        },
        pages: categoriesRes.data.map((cat: any) => ({
          category: cat.category || "unknown category",
          translatedCategory: cat.translatedCategory || [],
          _id: cat._id,
          itemPage: recipesRes.data
            .filter((r: any) => r.categoryId?._id === cat._id)
            .map((r: any) => ({
              title: r.title,
              ingredients: r.ingredients.join(","),
              preparation: r.preparation,
              imageUrl: r.imageUrl,
              createdAt: r.createdAt,
              _id: r._id,
            })),
        })),
      },
    };
    localStorage.setItem("recipeSiteData", JSON.stringify(site));
    console.log("Data loaded successfully:", site);
    return site;
  } catch (err: any) {
    console.error("Error loading data from API:", err);
    return { site: { pages: [] } };
  }
};

export const addRecipe = async (recipe: Recipe, category: Category): Promise<any> => {
  console.log("addRecipe api", recipe, category);
  if (!recipe.title || !category?._id) {
    console.error("Missing recipe or category ID");
    return null;
  }
  try {
    const res = await axios.post(
      `${BASE_URL}/api/recipes`,
      {
        title: recipe.title,
        ingredients: recipe.ingredients,
        preparation: recipe.preparation,
        categoryId: category._id,
        categoryName: category.category,
        imageUrl: recipe.imageUrl || "https://placehold.co/100x100?text=No+Image",
      },
      { headers: AUTH_HEADER }
    );
    console.log("Recipe added:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("Error adding recipe:", err.response?.data || err.message);
    return null;
  }
};

export const updateRecipe = async (updatedRecipe: Recipe): Promise<any> => {
  if (!updatedRecipe._id) {
    console.error("Missing recipe ID for update.");
    return null;
  }
  try {
    const res = await axios.put(
      `${BASE_URL}/api/spotit/${updatedRecipe._id}`,
      {
        title: updatedRecipe.title,
        ingredients: updatedRecipe.ingredients,
        preparation: updatedRecipe.preparation,
        imageUrl: updatedRecipe.imageUrl || "https://placehold.co/100x100?text=No+Image",
        categoryId: updatedRecipe.categoryId,
      },
      { headers: AUTH_HEADER }
    );
    console.log("Recipe updated:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("Error updating recipe:", err.response?.data || err.message);
    return null;
  }
};

export const delRecipe = async (recipeId: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/api/spotit/${recipeId}`, {
      headers: AUTH_HEADER,
    });
    console.log("Recipe deleted:", recipeId);
  } catch (err: any) {
    console.error("Error deleting recipe:", err.response?.data || err.message);
  }
};

export const addCategory = async (categoryName: string): Promise<any> => {
  if (!categoryName?.trim()) {
    console.warn("Category name is empty");
    return;
  }
  try {
    const res = await axios.post(
      `${BASE_URL}/api/categories`,
      { category: categoryName.trim() },
      { headers: AUTH_HEADER }
    );
    console.log("Category added:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("Error adding category:", err.response?.data || err.message);
    return null;
  }
};

export const delCategory = async (categoryId: string, categoryName?: string): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/api/categories/${categoryId}`, {
      headers: AUTH_HEADER,
    });
    console.log("Category deleted:", categoryId, categoryName);
  } catch (err: any) {
    console.error("Error deleting category:", err.response?.data || err.message);
  }
};

export const handleItemsChangeOrder = async (orderedCategories: Category[]): Promise<void> => {
  try {
    const updates = orderedCategories.map((cat, index) =>
      axios.put(
        `${BASE_URL}/api/categories/${cat._id}`,
        { priority: index + 1 },
        { headers: AUTH_HEADER }
      )
    );
    await Promise.all(updates);
    console.log("Categories reordered successfully");
  } catch (err: any) {
    console.error("Error updating category order:", err.response?.data || err.message);
  }
};

export const updateCategory = async (updatedCategory: Category): Promise<any> => {
  if (!updatedCategory._id) {
    console.error("Missing category ID for update.");
    return null;
  }
  try {
    const res = await axios.put(
      `${BASE_URL}/api/categories/${updatedCategory._id}`,
      {
        category: updatedCategory.category,
        // Add other fields to update as needed
      },
      { headers: AUTH_HEADER }
    );
    console.log("Category updated:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("Error updating category:", err.response?.data || err.message);
    return null;
  }
};
