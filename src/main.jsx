import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "./components/theme-provider.jsx";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider
        storageKey="vite-ui-theme"
        attribute="class"
        defaultTheme="light"
        enableSystem
      >
        <BrowserRouter>
          <App />
          <Toaster position="top-right" />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
