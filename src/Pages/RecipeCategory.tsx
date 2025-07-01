import React from "react";
import { useParams } from "react-router-dom";
import HomePage from "./HomePage";
import data from "../data/recipes.json";

interface RecipeCategoryProps {
  selectedRecipe: any;
  newRecipe: any;
  recipes: any;
  setRecipes: (recipes: any) => void;
  selectedCategory: any;
  setSelectedCategory: (cat: any) => void;
}

export default function RecipeCategory(props: RecipeCategoryProps) {
  const { selectedRecipe, newRecipe, recipes, setRecipes, selectedCategory, setSelectedCategory } = props;
  const { category, title } = useParams<{ category?: string; title?: string }>();
  console.log('trying to find category:', useParams());
  const pages = recipes?.site?.pages || [];

  // Normalize category (lowercase) for comparison
  const selectedCategoryData = pages.find(
    (page: any) => page?.category?.toLowerCase() === category?.toLowerCase()
  );

  if (!selectedCategoryData) {
    console.warn("Category recipes not found, adding first one now:", category)
  }

  setSelectedCategory(category);
  console.log("Found category:", selectedCategoryData);
  return <HomePage
    recipes={recipes}
    setRecipes={setRecipes}
    selectedCategory={selectedCategoryData}
    setSelectedCategory={setSelectedCategory}
  />;
}
