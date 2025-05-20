import React from "react";
import { useParams } from "react-router-dom";
import HomePage from "./HomePage";
import data from "../data/recipes.json";

export default function RecipeDetail(props) {
  const { selectedRecipe, newRecipe, recipes, setRecipes, selected, setSelected } = props;
  const { category, title } = useParams();

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
      return <div>Recipe not found.</div>;
    }
   // console.log("Found recipe:", selectedRecipeData);
    return (
      <HomePage
        selectedCategory={selectedCategoryData}
        selectedRecipe={selectedRecipeData}
        recipes={recipes}
        setRecipes={setRecipes}
        selected={selected}
        setSelected={setSelected}
      />
    );
  }  else {
    console.warn("Category not found:", category);
    return <div>Category not found.</div>;
  }
}
