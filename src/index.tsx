import React, { useEffect, useState } from "react";
import i18n from "./i18n";
import "bootstrap/dist/css/bootstrap.min.css";
import ReactDOM from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import RecipeCategory from "./Pages/RecipeCategory";
import RecipeDetail from "./Pages/RecipeDetail";
import HomePage from "./Pages/HomePage";
import "./styles.css";
import { CircularProgress, Box } from "@mui/material";
import { Provider } from "react-redux";
import * as storage from "./utils/storage";
import store from "./store/store";
import type { Recipe, Category } from "./utils/storage"; // adjust path as needed

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

// For Redux slice initial state:
interface DataState {
  selectedRecipe: Recipe | null;
  selectedCategory: Category | null;
  // ...other state fields...
}

const initialState: DataState = {
  selectedRecipe: null,
  selectedCategory: null,
  // ...other initial state...
};

function App() {
  const [recipes, setRecipes] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true); // Set initial theme to dark
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    title: "",
    ingredients: "",
    preparation: "",
  });
  // Song list state (array of songs)
  const [songList, setSongList] = useState<any[]>([]);

  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await storage.loadData(false);
      setRecipes(data);

      const categoryParam = params.category;
      const titleParam = params.title;

      if (data?.site?.pages && data.site.pages.length > 0) {
        let initialCategory = data.site.pages[0];
        if (categoryParam) {
          const foundCat = data.site.pages.find(
            (cat: any) => encodeURIComponent(cat.category) === categoryParam
          );
          if (foundCat) initialCategory = foundCat;
        }
        setSelectedCategory(initialCategory);

        if (titleParam && initialCategory.itemPage) {
          const foundRecipe = initialCategory.itemPage.find(
            (rec: any) => encodeURIComponent(rec.title) === titleParam
          );
          if (foundRecipe) setSelectedRecipe(foundRecipe);
        }
      }

      setLoading(false);
    };
    fetchData();
  }, [params.category, params.title]);

  useEffect(() => {
    document.title = "spotIt";
    document.body.dir =
      i18n.language === "he" || i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  useEffect(() => {
    if (selectedRecipe && selectedRecipe.title && selectedRecipe.category) {
      navigate(
        `/spotit/${encodeURIComponent(selectedRecipe.category)}/${encodeURIComponent(selectedRecipe.title)}`
      );
    }
  }, [selectedRecipe, navigate]);

  // Handler to add a song to the song list (to be passed to CaseCard)
  const handleAddSongToList = (song: any) => {
    setSongList((prev) => {
      if (prev.some((s) => s.title === song.title && s.artist === song.artist)) return prev;
      return [...prev, song];
    });
  };

  return (
    <>
      {loading && (
        <Box
          sx={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: 2000,
            background: isDarkMode ? "#333" : "#fffce8",
          }}
        >
          <CircularProgress size={64} />
        </Box>
      )}
      {!loading && recipes && (
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                recipes={recipes}
                setRecipes={setRecipes}
                selectedRecipe={selectedRecipe}
                setSelectedRecipe={setSelectedRecipe}
                setSelectedCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
                newRecipe={newRecipe}
                songList={songList}
                setSongList={setSongList}
                onAddSongToList={handleAddSongToList}
              />
            }
          />
          <Route
            path="/spotit/:category"
            element={
              <RecipeCategory
                recipes={recipes}
                setRecipes={setRecipes}
                selectedRecipe={selectedRecipe}
                selectedCategory={selectedCategory}
                newRecipe={newRecipe}
                setSelectedCategory={setSelectedCategory}
                songList={songList}
                setSongList={setSongList}
                onAddSongToList={handleAddSongToList}
              />
            }
          />
          <Route
            path="/spotit/:category/:title"
            element={
              <RecipeDetail
                recipes={recipes}
                selectedCategory={selectedCategory}
                selectedRecipe={selectedRecipe}
                newRecipe={newRecipe}
                setRecipes={setRecipes}
                setSelectedCategory={setSelectedCategory}
                songList={songList}
                setSongList={setSongList}
                onAddSongToList={handleAddSongToList}
              />
            }
          />
        </Routes>
      )}
    </>
  );
}

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <Router>
          <App />
        </Router>
      </I18nextProvider>
    </Provider>
  </React.StrictMode>
);