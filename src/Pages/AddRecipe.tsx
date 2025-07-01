import React from "react";
import { useParams } from "react-router-dom";
import HomePage from "./HomePage";
import data from "../data/recipes.json";

interface AddRecipeProps {
  recipes: any;
  setRecipes: (recipes: any) => void;
  selected: any;
  setSelected: (selected: any) => void;
  songList: any[];
  setSongList: (songs: any[]) => void;
  onAddSongToList: (song: any) => void;
}

  const { recipes, setRecipes, selected, setSelected, songList, setSongList, onAddSongToList } = props;
  const { category, title } = useParams<{ category?: string; title?: string }>();
  console.log(useParams());
  const pages = data?.site?.pages || [];

  // Normalize category (lowercase) for comparison
  const selectedCategoryData = pages.find(
    (page: any) => page?.category?.toLowerCase() === category?.toLowerCase()
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
        selectedRecipe={null}
        setSelectedRecipe={() => {}}
        songList={songList}
        setSongList={setSongList}
        onAddSongToList={onAddSongToList}
      />
    );
  }
  console.warn("Category not found:", category);
  return <div>Category not found.</div>;
}
