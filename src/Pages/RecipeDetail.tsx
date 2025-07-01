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
  songList: any[];
  setSongList: (songs: any[]) => void;
  onAddSongToList: (song: any) => void;
}


const RecipeDetail: React.FC<RecipeDetailProps> = (props) => {
  const { selectedRecipe, newRecipe, recipes, setRecipes, setSelectedCategory, selectedCategory, songList, setSongList, onAddSongToList } = props;
  const { category, title } = useParams();
  console.log('RecipeDetail params:', useParams());
  const pages = recipes?.site?.pages || [];


  // Normalize category (lowercase) for comparison
  const selectedCategoryData = pages.find(
    (page: any) => page?.category?.toLowerCase() === category?.toLowerCase()
  );

  const selectedRecipeData = selectedCategoryData?.itemPage?.find(
    (recipe: any) => recipe?.title?.toLowerCase() === title?.toLowerCase()
  );

  if (selectedCategoryData) {
    if (!selectedRecipeData) {
      console.warn("Recipe not found:", title);
      // Optionally render a not found message
    }
    console.log("Found recipe:", selectedRecipeData);
    return (
      <HomePage
        selectedCategory={selectedCategoryData}
        setSelectedCategory={setSelectedCategory}
        selectedRecipe={selectedRecipeData}
        setSelectedRecipe={() => {}}
        recipes={recipes}
        setRecipes={setRecipes}
        newRecipe={!selectedRecipeData}
        songList={songList}
        setSongList={setSongList}
        onAddSongToList={onAddSongToList}
      />
    );
  }
  console.warn("Category not found:", category);
  return <div>Category not found.</div>;
};

export default RecipeDetail;
