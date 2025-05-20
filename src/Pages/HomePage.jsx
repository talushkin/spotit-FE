<<<<<<< HEAD
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
  const [menuOpen, setMenuOpen] = useState(true);
  const { i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [desktop, setDesktop] = useState(window.innerWidth > 768); // Check if desktop

  // Define the handleHamburgerClick function
  const handleHamburgerClick = () => {
    console.log("Hamburger clicked", desktop);
    console.log("menuOpen", menuOpen);
    if (desktop) {
      setMenuOpen(true); // Always open on desktop
      return;
    }
    setMenuOpen((prevMenuOpen) => !prevMenuOpen); // Toggle the menu state
    if (!menuOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top when opening
      console.log("Should show the menu", menuOpen);
    }
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

  useEffect(() => {
    const handleResize = () => {
      setDesktop(window.innerWidth > 768); // Update desktop state based on window width
    };
    handleResize(); // Initial check on mount
    window.addEventListener("resize", handleResize); // Add event listener for window resize
  }, [window.innerWidth]);

  if (!recipes) return null; // Wait until recipes are loaded
  if (!recipes?.site?.pages) return null;

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <div className="App">
        <GlobalStyle />

        <div className="TOP">
          <HeaderBar
            desktop={desktop}
            logo={recipes?.site?.header?.logo}
            onHamburgerClick={handleHamburgerClick} // Pass the function here
            pages={recipes?.site?.pages}

            data={recipes}
          />
        </div>
        <div className="container-fluid ps-0 pe-0">
          <div className="row flex-column flex-md-row">
            <div
              className="nav-menu col-12 col-md-auto ps-0"
                  style={{ width: desktop ? '400px' : '100%'}}
            >
              <NavMenu
                pages={recipes?.site?.pages}
                toggleDarkMode={() => setIsDarkMode((prev) => !prev)}
                isOpen={menuOpen || desktop}
                onSelect={(item) => {
                  setSelected(item);
                  if (!desktop) setMenuOpen(false);
                }}
                editCategories={false}
                data={recipes}
                desktop={desktop}
                language={i18n.language}
              />
            </div>

            <div className="main-content col">
              {selected && (
                <MainContent
                  selected={selected}
                  selectedRecipe={selectedRecipe}
                  addRecipe={newRecipe}
                  data={recipes}
                />
              )}
            </div>
          </div>
        </div>


      </div>
    </ThemeProvider>
  );
=======
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
  const [menuOpen, setMenuOpen] = useState(true);
  const { i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [desktop, setDesktop] = useState(window.innerWidth > 768); // Check if desktop

  // Define the handleHamburgerClick function
  const handleHamburgerClick = () => {
    console.log("Hamburger clicked", desktop);
    console.log("menuOpen", menuOpen);
    if (desktop) {
      setMenuOpen(true); // Always open on desktop
      return;
    }
    setMenuOpen((prevMenuOpen) => !prevMenuOpen); // Toggle the menu state
    if (!menuOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top when opening
      console.log("Should show the menu", menuOpen);
    }
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

  useEffect(() => {
    const handleResize = () => {
      setDesktop(window.innerWidth > 768); // Update desktop state based on window width
    };
    handleResize(); // Initial check on mount
    window.addEventListener("resize", handleResize); // Add event listener for window resize
  }, [window.innerWidth]);

  if (!recipes) return null; // Wait until recipes are loaded
  if (!recipes?.site?.pages) return null;

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <div className="App">
        <GlobalStyle />

        <div className="TOP">
          <HeaderBar
            desktop={desktop}
            logo={recipes?.site?.header?.logo}
            onHamburgerClick={handleHamburgerClick} // Pass the function here
            pages={recipes?.site?.pages}

            data={recipes}
          />
        </div>
        <div className="container-fluid ps-0 pe-0">
          <div className="row flex-column flex-md-row">
            <div
              className="nav-menu col-12 col-md-auto ps-0"
                  style={{ width: desktop ? '400px' : '100%'}}
            >
              <NavMenu
                pages={recipes?.site?.pages}
                toggleDarkMode={() => setIsDarkMode((prev) => !prev)}
                isOpen={menuOpen || desktop}
                onSelect={(item) => {
                  setSelected(item);
                  if (!desktop) setMenuOpen(false);
                }}
                editCategories={false}
                data={recipes}
                desktop={desktop}
                language={i18n.language}
              />
            </div>

            <div className="main-content col">
              {selected && (
                <MainContent
                  selected={selected}
                  selectedRecipe={selectedRecipe}
                  addRecipe={newRecipe}
                  data={recipes}
                />
              )}
            </div>
          </div>
        </div>


      </div>
    </ThemeProvider>
  );
>>>>>>> a9ba5b25307e1e51fb4bcd3920e822172e771c75
}