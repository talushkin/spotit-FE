// utils/storage.js
import axios from "axios";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

// Base URL and Authorization token
const LOCAL_URL = "http://localhost:5000";
const BASE_URL = "https://be-tan-theta.vercel.app";

const AUTH_HEADER = {
  Authorization: `Bearer 1234`,
};

// Load categories and recipes from the server
export const loadData = async () => {
  try {
    // Fetch categories and recipes using direct axios calls
    const categoriesRes = await axios.get(`${BASE_URL}/api/categories`, {
      headers: AUTH_HEADER,
    });
    const recipesRes = await axios.get(`${BASE_URL}/api/recipes`, {
      headers: AUTH_HEADER,
    });

    console.log("categoriesRes", categoriesRes.data);
    console.log("recipesRes", recipesRes.data);

    // Construct the site object
    const site = {
      success: true,
      message: "Data loaded successfully",
      site: {
        pages: categoriesRes.data.map((cat) => ({
          category: cat.category || "unknown category",
          _id: cat._id,
          itemPage: recipesRes.data
            .filter((r) => r.categoryId?._id === cat._id)
            .map((r) => ({
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
    console.log("Data loaded successfully:", site);
    return site;
  } catch (err) {
    console.error("Error loading data from API:", err);
    return { site: { pages: [] } };
  }
};

// Add a new recipe
export const addRecipe = async (recipe, category) => {
  console.log("addRecipe api", recipe, category);
  if (!recipe.title || !category?._id) {
    console.error("Missing recipe or category ID");
    return null;
  }

  try {
    console.log("category", category);
    console.log("recipe", recipe);
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
  } catch (err) {
    console.error("Error adding recipe:", err.response?.data || err.message);
    return null;
  }
};

// Update a recipe
export const updateRecipe = async (updatedRecipe) => {
  if (!updatedRecipe._id) {
    console.error("Missing recipe ID for update.");
    return null;
  }
  try {
    const res = await axios.put(
      `${BASE_URL}/api/recipes/${updatedRecipe._id}`,
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
  } catch (err) {
    console.error("Error updating recipe:", err.response?.data || err.message);
    return null;
  }
};

// Delete a recipe
export const delRecipe = async (recipeId) => {
  try {
    await axios.delete(`${BASE_URL}/api/recipes/${recipeId}`, {
      headers: AUTH_HEADER,
    });
    console.log("Recipe deleted:", recipeId);
  } catch (err) {
    console.error("Error deleting recipe:", err.response?.data || err.message);
  }
};

// Add a new category
export const addCategory = async (categoryName) => {
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
  } catch (err) {
    console.error("Error adding category:", err.response?.data || err.message);
    return null;
  }
};

// Delete a category
export const delCategory = async (categoryId, categoryName) => {
  try {
    await axios.delete(`${BASE_URL}/api/categories/${categoryId}`, {
      headers: AUTH_HEADER,
    });
    console.log("Category deleted:", categoryId, categoryName);
  } catch (err) {
    console.error("Error deleting category:", err.response?.data || err.message);
  }
};

// Handle reordering of categories
export const handleItemsChangeOrder = async (orderedCategories) => {
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
  } catch (err) {
    console.error("Error updating category order:", err.response?.data || err.message);
  }
};
