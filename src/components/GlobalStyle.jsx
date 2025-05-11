// src/GlobalStyle.js
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.color};
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
  }

  h1, h2, h3, p {
    color: ${({ theme }) => theme.color};
  }
`;

export default GlobalStyle;
