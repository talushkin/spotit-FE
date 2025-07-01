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
import { useNavigate } from "react-router-dom";
import FooterBar from "../components/FooterBar";

interface HomePageProps {
  setSelectedRecipe: (recipe: any) => void;
  selectedRecipe: any;
  newRecipe: any;
  recipes: any;
  setRecipes: (recipes: any) => void;
  selectedCategory: any;
  setSelectedCategory: (cat: any) => void;
}

export default function Main(props: HomePageProps) {
  const { setSelectedRecipe, selectedRecipe, newRecipe, recipes, setRecipes, selectedCategory, setSelectedCategory } = props;
  const [menuOpen, setMenuOpen] = useState(false);
  const { i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [desktop, setDesktop] = useState(window.innerWidth > 768); // Check if desktop
  const navigate = useNavigate();

  // Add toggleDarkMode function
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

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

  useEffect(() => {
    const handleResize = () => {
      setDesktop(window.innerWidth > 768); // Update desktop state based on window width
    };
    handleResize(); // Initial check on mount
    window.addEventListener("resize", handleResize); // Add event listener for window resize
  }, [window.innerWidth]);

  // Helper to detect mobile
  const isMobile = !desktop;

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <div className="App">
        <GlobalStyle />

        <div className="TOP" style={{ background: isDarkMode ? '#000' : undefined }}>
          <HeaderBar
            desktop={desktop}
            logo={"https://vt-photos.s3.amazonaws.com/recipe-app-icon-generated-image.png"}
            onHamburgerClick={handleHamburgerClick}
            pages={recipes?.site?.pages}
            isDarkMode={isDarkMode}
            data={recipes}
            toggleDarkMode={toggleDarkMode}
            setSelectedCategory={setSelectedCategory}
            setSelectedRecipe={setSelectedRecipe}
            selectedRecipe={selectedRecipe}
            selectedCategory={selectedCategory}
            showLangAndTheme={!isMobile} // Pass prop to hide on mobile
          />
        </div>
        <div className="container-fluid ps-0 pe-0">
          <div className="flex-column flex-md-row ps-0 pe-0 row">
            <div
              className="nav-menu col-12 col-md-auto ps-0 pe-0"
              style={{ width: desktop ? '270px' : '100%' }}
            >
              <NavMenu
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
                pages={recipes?.site?.pages}
                isOpen={menuOpen || desktop}
                onSelect={setSelectedCategory}
                editCategories={false}
                data={recipes}
                desktop={desktop}
                language={i18n.language}
                setSelectedRecipe={setSelectedRecipe}
                selectedRecipe={selectedRecipe}
                showLangAndTheme={!isMobile} // Hide from menu on mobile
                onHamburgerClick={handleHamburgerClick}
              />
            </div>

            <div className="main-content col">
              {selectedCategory && (
                <MainContent
                  selectedCategory={selectedCategory}
                  selectedRecipe={selectedRecipe}
                  addRecipe={newRecipe}
                  data={recipes}
                  desktop={desktop}
                  isDarkMode={isDarkMode}
                  setSelectedRecipe={setSelectedRecipe}
                />
              )}
            </div>
          </div>
        </div>
        {/* Sticky FooterBar only on mobile */}
        {isMobile && (
          <FooterBar
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            language={i18n.language}
            i18n={i18n}
          />
        )}
      </div>
    </ThemeProvider>
  );
}