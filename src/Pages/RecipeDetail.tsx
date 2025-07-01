import React from "react";
import { useParams } from "react-router-dom";
import HomePage from "./HomePage";

interface RecipeDetailProps {
  selectedRecipe: any;
  newRecipe: any;
  recipes: any;
  setRecipes: (recipes: any) => void;
  setSelectedCategory: (cat: any) => void;
  selectedCategory: any;
}

export default function RecipeDetail(props: RecipeDetailProps) {
  const { selectedRecipe, newRecipe, recipes, setRecipes, setSelectedCategory, selectedCategory } = props;
  const { category, title } = useParams();
  console.log('RecipeDetail params:', useParams());
  const pages = recipes?.site?.pages || [];

  // Normalize category (lowercase) for comparison
  const selectedCategoryData = pages.find(
    (page) => page?.category?.toLowerCase() === category?.toLowerCase()
  );

  const selectedRecipeData = selectedCategoryData.itemPage.find(
    (recipe) => recipe?.title?.toLowerCase() === title?.toLowerCase()
  );

  if (selectedCategoryData) {
   // console.log("Found category:", selectedCategoryData, selectedRecipeData);
    if (!selectedRecipeData) {
      console.warn("Recipe not found:", title);
      // return <div>Recipe not found.</div>;
    }
    console.log("Found recipe:", selectedRecipeData);
    return (
      <HomePage
        selectedCategory={selectedCategoryData}
        setSelectedCategory={setSelectedCategory}
        selectedRecipe={selectedRecipeData}
        recipes={recipes}
        setRecipes={setRecipes}
        newRecipe={!selectedRecipeData}
        />
    );
  }  else {
    console.warn("Category not found:", category);
    return <div>Category not found.</div>;
  }
}
