// Log songList and index whenever songList changes

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setSearchOptions } from "./store/dataSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,useParams
} from "react-router-dom";
import HomePage from "./Pages/HomePage";
import WatchPage from "./Pages/WatchPage";
import "./styles.css";
import { CircularProgress, Box } from "@mui/material";
import { Provider } from "react-redux";
import * as storage from "./utils/storage";
import store from "./store/store";
import type { Song, Genre } from "./utils/storage"; // adjust path as needed
import AuthGate, { AuthUser, clearRefreshTokenCookie, getAuthUserFromRefreshTokenCookie } from "./components/AuthGate";

const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);


// (Removed unused DataState and initialState)

function App() {
  const dispatch = useDispatch();
  const [songs, setSongs] = useState<any>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Set initial theme to dark
  // Song list state (array of songs)
  const [songList, setSongList] = useState<any[]>([
  ]);
  const [playlistHydrated, setPlaylistHydrated] = useState(false);

  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    const user = getAuthUserFromRefreshTokenCookie();
    if (user) {
      setAuthUser(user);
    }
    setAuthInitialized(true);
  }, []);

  useEffect(() => {
    if (!authInitialized || !authUser) {
      setSongs(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setPlaylistHydrated(false);
      const data = await storage.loadData(false);
      setSongs(data);
      // Support both { site: { genres: Genre[] } } and { site: { site: { genres: Genre[] } } }
      let genres: Genre[] | undefined = undefined;
      if (data && 'site' in data && data.site) {
        // If data.site.site exists, use that
        if ('site' in data.site && data.site.site && 'genres' in data.site.site) {
          genres = (data.site.site as any).genres;
        } else if ('genres' in data.site) {
          genres = (data.site as any).genres;
        }
      }
      if (genres && genres.length > 0) {
        let initialGenre = genres[0];
        setSelectedGenre(initialGenre);
        // Find the default song across all genres
        let defaultSong = null;
        for (const genre of genres) {
          if (genre.songs) {
            defaultSong = genre.songs.find((s: any) => s.default === true);
            if (defaultSong) break;
          }
        }
        const initialSong = defaultSong || initialGenre.songs[0] || null;
        const playlistUser = {
          id: authUser.id,
          email: authUser.email,
        };
        const hasSavedPlaylist = storage.hasSavedUserPlaylist(playlistUser);
        const savedPlaylist = storage.loadUserPlaylistFromLocalStorage(playlistUser);
        if (hasSavedPlaylist) {
          setSongList(savedPlaylist);
          setSelectedSong(savedPlaylist[0] || null);
        } else {
          setSelectedSong(initialSong);
          setSongList(initialSong ? [initialSong] : []);
        }
        // Set search options to all songs from all genres in Redux
        const allSongs = genres.flatMap((g) => g.songs || []);
        //dispatch(setSearchOptions(allSongs));
      } else {
        dispatch(setSearchOptions([]));
        setSongList([]);
      }

      setPlaylistHydrated(true);
      setLoading(false);
    };
    fetchData();
  }, [authInitialized, authUser, params.category, params.title]);

  // useEffect(() => {
  //   document.title = "spotIt";
  //   document.body.dir = "ltr";
  //   setSelectedSong(songList[0] || null); // Set initial selected song if available
  // }, []);

  // Log songList and index whenever songList changes
  useEffect(() => {
    console.log('songList updated:', songList.map((s: any, i: number) => ({ index: i, ...s })));
  }, [songList]);

  useEffect(() => {
    if (!authUser || !playlistHydrated) return;
    storage.saveUserPlaylistToLocalStorage(songList as Song[], {
      id: authUser.id,
      email: authUser.email,
    });
  }, [songList, authUser, playlistHydrated]);
  

  // Handler to add a song to the song list (to be passed to CaseCard)
  const handleAddSongToList = (song: any, location?: number) => {
    console.log("Adding song to list:", song, "at location:", location);
    //console.log("Current song:", selectedSong);
    setSongList((prev) => {
      if (prev.some((s) => s.title === song.title && s.artist === song.artist)) return prev;
      if (location === 1) {
        // Add to top (first position) but keep only one instance at the top
        console.log("Adding song to top of list and start playing",song.title);
        const filtered = prev.filter((s: any) => !(s.title === song.title && s.artist === song.artist));
        const newList = [song, ...filtered];
        setSelectedSong(song); // Set the newly added song as selected
        return newList;
      } else if (location === -1) {
        // Add to bottom (last position)
        console.log("Adding song to bottom of list",song.title);
        return [...prev, song];
      } else {
        console.log("Adding song to bottom of list",song.title);
        // Default: add to bottom
        return [...prev, song];
      }
    });
  };

  const handleLogout = () => {
    clearRefreshTokenCookie();
    setAuthUser(null);
    setSongs(null);
    setSongList([]);
    setSelectedSong(null);
  };

  const handleSettings = () => {
    window.alert("Settings menu selected.");
  };

  const handleSavePlaylist = () => {
    if (!authUser) return;
    storage.saveUserPlaylistToLocalStorage(songList as Song[], {
      id: authUser.id,
      email: authUser.email,
    });
    window.alert("Playlist saved.");
  };

  const handleExportPlaylist = () => {
    if (!authUser) return;
    storage.exportPlaylistJsonFile(songList as Song[], {
      id: authUser.id,
      email: authUser.email,
    });
    window.alert("Playlist exported. Move the downloaded file to public/data if you want it bundled in app assets.");
  };

  return (
    <>
      {!authInitialized && (
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

      {authInitialized && !authUser && (
        <AuthGate
          onAuthSuccess={(user) => {
            setAuthUser(user);
          }}
          onSkip={() => {
            setAuthUser({
              id: "guest",
              name: "Unidentified",
              firstName: "Unidentified",
              lastName: "",
              email: "unidentified@spotit.local",
            });
          }}
        />
      )}

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

      {authInitialized && authUser && !loading && songs && (
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                songs={songs}
                setSongs={setSongs}
                selectedSong={selectedSong}
                setSelectedSong={setSelectedSong}
                setSelectedGenre={setSelectedGenre}
                selectedGenre={selectedGenre}
                songList={songList}
                setSongList={setSongList}
                onAddSongToList={handleAddSongToList}
                authUser={authUser}
                onLogout={handleLogout}
                onSettings={handleSettings}
                onSavePlaylist={handleSavePlaylist}
                onExportPlaylist={handleExportPlaylist}
              />
            }
          />
          <Route
            path="/watch/:videoId"
            element={<WatchPageRoute />}
          />
        </Routes>
      )}
    </>
  );

// Route component to extract videoId param using useParams
function WatchPageRoute() {
  const { videoId } = useParams();
  if (!videoId || typeof videoId !== 'string') return null;
  return <WatchPage videoId={videoId} />;
}
}

root.render(
  <React.StrictMode>
    <Provider store={store}>
        <Router>
          <App />
        </Router>
    </Provider>
  </React.StrictMode>
);