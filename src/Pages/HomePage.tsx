import "../styles.css";
import React, { useState, useEffect } from "react";
import HeaderBar from "../components/HeaderBar";
import MainContent from "../components/MainContent";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "../components/themes";
import GlobalStyle from "../components/GlobalStyle";
import FooterBar from "../components/FooterBar";
import type { Genre, Song, SiteData } from "../utils/storage";


interface HomePageProps {
  setSelectedSong: (song: Song | null) => void;
  selectedSong: Song | null;
  songs: SiteData;
  setSongs: (songs: SiteData) => void;
  selectedGenre: Genre | null;
  setSelectedGenre: (genre: Genre | null) => void;
  songList: Song[];
  setSongList: (songs: Song[]) => void;
  onAddSongToList: (song: Song, location?: number) => void;
}

function HomePage(props: HomePageProps) {
  const { setSelectedSong, selectedSong, songs, setSongs, selectedGenre, setSelectedGenre, songList, setSongList, onAddSongToList } = props;
 // console.log("HomePage genres:", songs?.site?.genres);
  const [menuOpen, setMenuOpen] = useState(false);
  // Language support removed: only English
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [desktop, setDesktop] = useState(window.innerWidth > 768); // Check if desktop
  const [footerHidden, setFooterHidden] = useState(false);
  //console.log("props", props);
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
      <GlobalStyle theme={isDarkMode ? darkTheme : lightTheme} />
      <div className={isDarkMode ? "dark" : "light"}>
        <HeaderBar
          logo={"/logo192.png"}
          onHamburgerClick={handleHamburgerClick}
          genres={songs?.site?.genres || []}
          desktop={desktop}
          setSelectedGenre={setSelectedGenre as (genre: any) => void}
          setSelectedSong={setSelectedSong as (song: any) => void}
          selectedSong={selectedSong}
          isDarkMode={isDarkMode}
          songList={songList}
          setSongList={setSongList}
          onAddSongToList={onAddSongToList}
        />
        <div className="container-fluid" style={{ paddingBottom: 0 }}>
          <div className="row">
            <div className="col-12">
              {/* Only pass the correct props to MainContent */}
              <MainContent
                selectedGenre={selectedGenre as Genre}
                selectedSong={selectedSong as Song}
                desktop={desktop}
                isDarkMode={isDarkMode}
                songList={songList}
                setSongList={setSongList}
                onAddSongToList={onAddSongToList}
                setSelectedSong={setSelectedSong}
                footerHidden={footerHidden}
                setFooterHidden={setFooterHidden}
              />
            </div>
          </div>
        </div>
        {/* Sticky FooterBar only on mobile */}
        <FooterBar
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          selectedSong={selectedSong ?? undefined}
          setSelectedSong={setSelectedSong}
          setSongList={setSongList}
          songList={songList}
          hidden={footerHidden}
          onShowFooter={() => setFooterHidden(false)}
        />
      </div>
    </ThemeProvider>
  );
};

export default HomePage;