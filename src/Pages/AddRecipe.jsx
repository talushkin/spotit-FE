import React from "react";
import { useParams } from "react-router-dom";
import HomePage from "./HomePage";
import data from "../data/recipes.json";

export default function RecipeDetail(props) {
  const { recipes, setRecipes, selected, setSelected } = props;
  const { category, title } = useParams();
  console.log(useParams());
  const pages = data?.site?.pages || [];

  // Normalize category (lowercase) for comparison
  const selectedCategoryData = pages.find(
    (page) => page?.category?.toLowerCase() === category?.toLowerCase()
  );

  if (selectedCategoryData) {
    console.log("Found category:", selectedCategoryData);
    return (
      <HomePage
        selectedCategory={selectedCategoryData}
        newRecipe={true}
        recipes={recipes}
        setRecipes={setRecipes}
        selected={selected}
        setSelected={setSelected}
      />
    );
  } else {
    console.warn("Category not found:", category);
    return <div>Category not found.</div>;
  }
}
