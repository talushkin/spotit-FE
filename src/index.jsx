import React, { useEffect, useState } from "react";
import i18n from "./i18n.js";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import ReactDOM from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RecipeList from "./Pages/RecipeList";
import RecipeDetail from "./Pages/RecipeDetail";
import AddRecipe from "./Pages/AddRecipe";
import HomePage from "./Pages/HomePage";
import "./styles.css";

// Import Redux Provider and store
import { Provider } from "react-redux";
import store from "./store/store";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/recipes/:category" element={<RecipeList />} />
            <Route path="/recipes/:category/:title" element={<RecipeDetail />} />
            <Route path="/recipes/:category/add" element={<AddRecipe />} />
          </Routes>
        </Router>
      </I18nextProvider>
    </Provider>
  </React.StrictMode>
);
