import React, { useState, useEffect } from "react";
import CaseCard from "./CaseCard";
import Pagination from "@mui/material/Pagination";
import Button from "@mui/material/Button";
import RecipeDialog from "./RecipeDialog";
import { useTranslation } from "react-i18next";
import { translateDirectly } from "./translateAI";
import { generateImage } from "./imageAI";
import { useDispatch } from "react-redux";
import { addRecipeThunk, delRecipeThunk, updateRecipeThunk } from "../store/dataSlice";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import type { Recipe, Category } from "../utils/storage";

// --- Types ---

interface MainContentProps {
  data: any;
  selectedCategory: Category;
  selectedRecipe: Recipe | null;
  addRecipe: any;
  desktop: boolean;
  isDarkMode: boolean;
  songList: any[];
  setSongList: (songs: any[]) => void;
  onAddSongToList: (song: any) => void;
}


interface SortableRecipeProps {
  recipe: Recipe;
  index: number;
  onSelect: (recipe: Recipe) => void;
  onAddSongToList: (song: any) => void;
}

function SortableRecipe({ recipe, index, onSelect, onAddSongToList }: SortableRecipeProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: recipe._id!,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: "10px",
    cursor: "grab",
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap" as const,
    gap: "1rem",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(recipe)}
    >
      <CaseCard
        item={recipe}
        category={recipe.category || ""}
        index={index + 1}
        onAddSongToList={onAddSongToList}
      />
    </div>
  );
}

const MainContent: React.FC<MainContentProps> = ({
  data,
  selectedCategory,
  selectedRecipe,
  addRecipe,
  desktop,
  isDarkMode,
  songList,
  setSongList,
  onAddSongToList,
}) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [page, setPage] = useState<number>(1);
  const [translatedCategory, setTranslatedCategory] = useState<string>(selectedCategory?.category);
  const itemsPerPage = 20;
  const [openView, setOpenView] = useState<boolean>(!!selectedRecipe);
  const [openAdd, setOpenAdd] = useState<boolean>(!!addRecipe);
  const [openFill, setOpenFill] = useState<boolean>(false);
  const [viewedItem, setViewedItem] = useState<Recipe | null>(selectedRecipe || null);
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    title: "",
    ingredients: "",
    preparation: "",
  });
  const [editOrder, setEditOrder] = useState<boolean>(false);
  const [rowJustify, setRowJustify] = useState<string>(
    window.innerWidth <= 770
      ? "center"
      : (i18n.dir && i18n.dir() === "rtl")
      ? "flex-end"
      : "flex-start"
  );

  // Assume recipes are stored in selectedCategory?.itemPage
  const [recipes, setRecipes] = useState<Recipe[]>(selectedCategory?.itemPage || []);
  const navigate = useNavigate();

  useEffect(() => {
    setOpenView(!!selectedRecipe);
  }, [selectedRecipe]);

  useEffect(() => {
    setRecipes(selectedCategory?.itemPage || []);
  }, [selectedCategory]);

  // Translate category name
  useEffect(() => {
    const translateCategory = async () => {
      const lang = i18n.language;
      if (selectedCategory?.category && lang !== "en") {
        // Check if translation already exists in translatedCategory array
        if (
          Array.isArray(selectedCategory.translatedCategory) &&
          selectedCategory.translatedCategory.length > 0 &&
          typeof selectedCategory.translatedCategory[0] === "object"
        ) {
          const found = (selectedCategory.translatedCategory as unknown as { lang: string; value: string }[]).find(
            (t) => t.lang === lang && t.value
          );
          if (found) {
            setTranslatedCategory(found.value);
            return;
          }
        }
        // Fallback: check object format (for backward compatibility)
        if (
          selectedCategory.translatedCategory &&
          (selectedCategory.translatedCategory as any)[lang]
        ) {
          setTranslatedCategory((selectedCategory.translatedCategory as any)[lang]);
          return;
        }
        // If not, translate and show
        const translated = await translateDirectly(selectedCategory.category, lang);
        setTranslatedCategory(translated);
      } else {
        setTranslatedCategory(selectedCategory?.category);
      }
    };
    translateCategory();
  }, [selectedCategory?.category, selectedCategory?.translatedCategory, i18n.language]);

  // Sensors for DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleRecipeDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = recipes.findIndex((r) => r._id === active.id);
      const newIndex = recipes.findIndex((r) => r._id === over.id);
      const newRecipes = arrayMove(recipes, oldIndex, newIndex);
      setRecipes(newRecipes);
      // Optionally: dispatch a thunk to persist this new order
      // dispatch(reorderRecipesThunk(newRecipes));
    }
  };

  const handleAddRecipe = async (recipe: Recipe) => {
    let newRecipeData: Recipe = {
      title: recipe?.title,
      ingredients: recipe?.ingredients,
      preparation: recipe?.preparation,
      categoryId: selectedCategory?._id,
      imageUrl: recipe?.imageUrl || "",
      category: selectedCategory?.category,
    };

    // Translate fields to English if current language is not English
    if (i18n.language !== "en") {
      try {
        const [titleEn, ingredientsEn, preparationEn] = await Promise.all([
          translateDirectly(newRecipeData.title ?? "", "en"),
          translateDirectly(newRecipeData.ingredients ?? "", "en"),
          translateDirectly(newRecipeData.preparation ?? "", "en"),
        ]);
        newRecipeData = {
          ...newRecipeData,
          title: titleEn,
          ingredients: ingredientsEn,
          preparation: preparationEn,
        };
      } catch (e) {
        // fallback to original if translation fails
      }
    }

    try {
      const response = await ( (dispatch as any)(addRecipeThunk({ recipe: newRecipeData, category: selectedCategory })) ).unwrap();
      setRecipes([...recipes, newRecipeData]);
    } catch (error: any) {
      console.error("Error adding recipe:", error.response?.data || error.message);
    }

    setNewRecipe({ title: "", ingredients: "", preparation: "" });
    setOpenAdd(false);
    setOpenView(false);
  };

  // New function: Update existing recipe
  const handleUpdateRecipe = async (updatedRecipe: Recipe) => {
    updatedRecipe._id = viewedItem?._id; // Ensure we have the correct ID
    updatedRecipe.categoryId = selectedCategory?._id; // Ensure we have the correct category ID
    updatedRecipe.category = selectedCategory?.category; // Ensure we have the correct category name
    try {
      const response = await ( (dispatch as any)(updateRecipeThunk(updatedRecipe)) ).unwrap();
      setRecipes((prevRecipes) =>
        prevRecipes.map((r) => (r._id === updatedRecipe._id ? updatedRecipe : r))
      );
      setOpenView(false);
    } catch (error: any) {
      console.error("Error updating recipe:", error.response?.data || error.message);
    }
  };

  // Function to delete a recipe using Redux and update local state
  const handleDeleteRecipe = (recipe: Recipe) => {
    if (window.confirm(t("Are you sure you want to delete this recipe? ID:" + recipe._id + " " + recipe.title))) {
      ( (dispatch as any)(delRecipeThunk(recipe._id!)) )
        .unwrap()
        .then(() => {
          setRecipes((prevRecipes) =>
            prevRecipes.filter((r) => r._id !== recipe._id)
          );
        })
        .catch((err: any) => {
          console.error("Error deleting recipe:", err);
        });
    }
  };

  const totalItems = recipes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = recipes.slice(startIndex, endIndex);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setViewedItem(recipe);
    setOpenView(true);
    if (recipe && selectedCategory?.category && recipe?.title) {
      const categoryEncoded = encodeURIComponent(selectedCategory?.category);
      const titleEncoded = encodeURIComponent(recipe?.title);
      navigate(`/spotit/${categoryEncoded}/${titleEncoded}`);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setRowJustify(
        window.innerWidth <= 770
          ? "center"
          : (i18n.dir && i18n.dir() === "rtl")
          ? "flex-end"
          : "flex-start"
      );
    };
    window.addEventListener("resize", handleResize);
    // Also update on language direction change
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [i18n.language]);

  const handleCloseDialog = () => {
    setOpenView(false);
    setOpenAdd(false);
    if (selectedCategory?.category) {
      const categoryEncoded = encodeURIComponent(selectedCategory.category);
      navigate(`/spotit/${categoryEncoded}`);
    }
  };

  return (
    <div className="main">
      <div
        className="main-title"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "1rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            flexBasis: "100%",
            textAlign: "center",
            color: isDarkMode ? "white" : "inherit",
            fontSize:
              translatedCategory && translatedCategory.length > 24
                ? "1.2rem"
                : "2rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100vw",
            lineHeight: translatedCategory && translatedCategory.length > 24
                ? "1.2rem"
                : "2rem",
                marginTop: "1rem",
          }}
          title={translatedCategory}
        >
          {translatedCategory}
        </div>

        {/* Removed Add Recipe and Add Recipe AI buttons */}
      </div>
      <p style={{ flexBasis: "100%", textAlign: "center" }}>
        {t("page")} {page}, {t("recipes")} {startIndex + 1}–{endIndex} {t("of")} {totalItems}
      </p>
      {totalPages > 1 && (
        <div className="pagination-container" style={{ direction: i18n.dir && i18n.dir() === "rtl" ? "rtl" : "ltr" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              "& .MuiPaginationItem-root": {
                color: (theme) => (isDarkMode ? "white" : "inherit"),
                direction: i18n.dir && i18n.dir() === "rtl" ? "ltr" : "ltr",
              },
              "& .Mui-selected": {
                backgroundColor: isDarkMode ? "#fff" : "",
                color: isDarkMode ? "#222" : "",
              },
            }}
            dir={i18n.dir && i18n.dir() === "rtl" ? "ltr" : "ltr"}
          />
        </div>
      )}
      {editOrder ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleRecipeDragEnd}>
          <SortableContext items={recipes.map((r) => r._id!)} strategy={verticalListSortingStrategy}>
            {recipes.map((recipe, index) => (
              <SortableRecipe
                key={recipe._id}
                recipe={recipe}
                index={index}
                onSelect={handleSelectRecipe}
                onAddSongToList={onAddSongToList}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : ( window.innerWidth && (
        <div
          className="row d-flex"
          style={{
            justifyContent: rowJustify,
          }}
        >
          {currentItems.map((item, index) => {
            let colClass = "col-2";//"col-12 col-sm-8 col-md-6 col-lg-3";
            return (
              <div
                key={index}
                className={`${colClass} mb-4 d-flex`}
                style={{
                  justifyContent: rowJustify,
                }}
                onClick={() => handleSelectRecipe(item)}
              >
                <CaseCard
                  index={startIndex + index + 1}
                  item={item}
                  category={selectedCategory?.category}
                  isDarkMode={isDarkMode}
                  onAddSongToList={onAddSongToList}
                />
              </div>
            );
          })}
        </div>
      )
      )}

    </div>
  );
};

export default MainContent;
