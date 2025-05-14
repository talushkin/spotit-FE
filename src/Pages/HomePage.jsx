import "../styles.css";
import React, { useState, useEffect } from "react";
import HeaderBar from "../components/HeaderBar";
import NavMenu from "../components/NavMenu";
import MainContent from "../components/MainContent";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "../components/themes";
import GlobalStyle from "../components/GlobalStyle";
import * as store from "../utils/storage"; // adjust path if needed

export default function Main({ selectedCategory, selectedRecipe, newRecipe }) {
  const [recipes, setRecipes] = useState(null); // Initialize with null
  const [selected, setSelected] = useState(selectedCategory);
  const [menuOpen, setMenuOpen] = useState(false);
  const { i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Define the handleHamburgerClick function
  const handleHamburgerClick = () => {
    setMenuOpen((prevMenuOpen) => !prevMenuOpen); // Toggle the menu state
  };

  // Fetch recipes data on component mount
  useEffect(() => {
    const fetchData = async () => {
      const data = await store.loadData(); // Call the async function
      setRecipes(data); // Update state with the fetched data
      setSelected(data?.site?.pages[0]); // Set the first page as selected
    };
    fetchData();
  }, []); // Empty dependency array ensures this runs only once

  useEffect(() => {
    console.log("recipes", recipes); // Log recipes whenever it updates
  }, [recipes]);

  if (!recipes) return null; // Wait until recipes are loaded
  if (!recipes?.site?.pages) return null;

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <div className="App">
        <GlobalStyle />
        <div>
          <div className="TOP">
            <HeaderBar
              logo={recipes?.site?.header?.logo}
              onHamburgerClick={handleHamburgerClick} // Pass the function here
              pages={recipes?.site?.pages}
              toggleDarkMode={() => setIsDarkMode((prev) => !prev)} // Toggle dark mode
              data={recipes}
            />
            <NavMenu
              pages={recipes?.site?.pages}
              isOpen={menuOpen}
              onSelect={setSelected}
              data={recipes}
            />
            {selected && (<MainContent
              selected={selected}
              selectedRecipe={selectedRecipe}
              addRecipe={newRecipe}
              data={recipes}
            />)}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}