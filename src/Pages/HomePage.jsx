import "../styles.css";
import defaultData from "../data/recipes.json";
import { useState, useEffect } from "react";
import HeaderBar from "../components/HeaderBar";
import NavMenu from "../components/NavMenu";
import MainContent from "../components/MainContent";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "../components/themes";
import GlobalStyle from "../components/GlobalStyle";
import * as store from "../utils/storage"; // adjust path if needed

export default function Main({ selectedCategory, selectedRecipe, newRecipe }) {
  const [recipes, setRecipes] = useState(store.loadData(defaultData));
  const [selected, setSelected] = useState(
    selectedCategory || recipes.site.pages[0]
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const { i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const addNewRecipe = {
    image: "https://placehold.co/100x100?text=Paris",
    title: "Parisian Steak",
    description: "Juicy steak with a Paris-style herb sauce.",
    ingredients: "Beef, butter, garlic, thyme, salt, pepper",
    preparation: "Sear the meat on a hot pan, add butter and herbs. Serve hot.",
    createdAt: "01-05-2025",
  };
  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "enabled";
    setIsDarkMode(savedDarkMode);
    //store.addCategory("Desserts2");
    console.log("recipes:", recipes);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("darkMode", !isDarkMode ? "enabled" : "disabled");
  };

  // Update direction based on language
  useEffect(() => {
    document.body.dir =
      i18n.language === "ar" || i18n.language === "en" ? "rtl" : "ltr";
  }, [i18n.language]);

  // Define the hamburger toggle as a const function
  const handleHamburgerClick = () => {
    console.log(!menuOpen ? "on" : "off");
    setMenuOpen(!menuOpen); // Toggle the menu state
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <div className="App">
        <GlobalStyle />
        <div>
          <div className="TOP">
            <HeaderBar
              logo={recipes?.site?.header?.logo}
              onHamburgerClick={handleHamburgerClick}
              pages={recipes.site.pages}
              toggleDarkMode={toggleDarkMode}
              data={recipes}
            />
            <NavMenu
              pages={recipes?.site?.pages}
              isOpen={menuOpen}
              onSelect={setSelected}
              data={recipes}
            />
            <MainContent
              selected={selected}
              selectedRecipe={selectedRecipe}
              addRecipe={newRecipe}
              data={recipes}
            />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
