import React, { useEffect, useState } from "react";
import i18n from "./i18n.js";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import ReactDOM from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom"; // <-- add useNavigate
import RecipeCategory from "./Pages/RecipeCategory.jsx";
import RecipeDetail from "./Pages/RecipeDetail";
import AddRecipe from "./Pages/AddRecipe";
import HomePage from "./Pages/HomePage";
import "./styles.css";

// Import Redux Provider and store
import { Provider } from "react-redux";
import * as storage from "./utils/storage"; // adjust path if needed
import store from "./store/store.js"

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

function App() {
  const [recipes, setRecipes] = useState(null);
  const [selected, setSelected] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const navigate = useNavigate(); // <-- add this line

  useEffect(() => {
    const fetchData = async () => {
      const data = await storage.loadData();
      setRecipes(data);
      if (!selectedCategory && data?.site?.pages && data.site.pages.length > 0) {
        console.log("Setting initial selectedCategory to:", data?.site?.pages[0]);
        setSelectedCategory(data?.site?.pages[0]);
              navigate(
        `/recipes/${encodeURIComponent(data?.site?.pages[0].category)}`
      );
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    //console.log("recipes", recipes);
  }, [recipes]);

  useEffect(() => {
    document.body.dir = i18n.language === "he" || i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  // Add this effect to navigate to the recipe URL when selectedRecipe changes
  useEffect(() => {
    console.log("selectedRecipe changed:", selectedRecipe);
    if (selectedRecipe && selectedRecipe.title && selectedRecipe.category) {
      navigate(
        `/recipes/${encodeURIComponent(selectedRecipe.category)}/${encodeURIComponent(selectedRecipe.title)}`
      );
    }
  }, [selectedRecipe, navigate]);

  return (
    <>
      {recipes && (
        <Routes>
          <Route path="/"
            element={<HomePage
              recipes={recipes}
              setRecipes={setRecipes}
              selectedRecipe={selectedRecipe}
              setSelectedRecipe={setSelectedRecipe}
              setSelectedCategory={setSelectedCategory}
              selectedCategory={selectedCategory}
            />} />
          <Route path="/recipes/:category"
            element={<RecipeCategory
              recipes={recipes}
              setRecipes={setRecipes}
              selectedRecipe={selectedRecipe}
              setSelectedRecipe={setSelectedRecipe}
              setSelectedCategory={setSelectedCategory}
              selectedCategory={selectedCategory}
            />} />
          <Route path="/recipes/:category/:title"
            element={<RecipeDetail
              recipes={recipes}
              setSelectedCategory={setSelectedCategory}
              selectedCategory={selectedCategory}
              setSelected={setSelected}
              selectedRecipe={selectedRecipe}
              setSelectedRecipe={setSelectedRecipe}
            />} />
          <Route path="/recipes/:category/add"
            element={<AddRecipe
              recipes={recipes}
              setRecipes={setRecipes}
              setSelectedCategory={setSelectedCategory}
              selectedCategory={selectedCategory}
              selectedRecipe={selectedRecipe}
              setSelectedRecipe={setSelectedRecipe}
            />} />
        </Routes>
      )}
    </>
  )
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
