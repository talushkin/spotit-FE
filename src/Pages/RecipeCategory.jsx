import React from "react";
import { useParams } from "react-router-dom";
import HomePage from "./HomePage";
import data from "../data/recipes.json";

export default function RecipeCategory(props) {
  const { selectedRecipe, newRecipe, recipes, setRecipes, selected, setSelected } = props;
  const { category, title } = useParams();
  console.log('trying to find category:', useParams());
  const pages = recipes?.site?.pages || [];

  // Normalize category (lowercase) for comparison
  const selectedCategoryData = pages.find(
    (page) => page?.category?.toLowerCase() === category?.toLowerCase()
  );

  if (!selectedCategoryData) {
     console.warn("Category recipes not found, adding first one now:", category)
  }
   

  // console.log("Found category:", selectedCategoryData);
  return <HomePage
    recipes={recipes}
    setRecipes={setRecipes}
    setSelected={setSelected}
    selected={selectedCategoryData} />;
}
