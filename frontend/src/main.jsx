import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        theme={{
          fontFamily: "Space Grotesk, Inter, system-ui, -apple-system, sans-serif",
          headings: { fontWeight: "700" },
          primaryColor: "indigo",
        }}
        defaultColorScheme="dark"
      >
        <Notifications position="top-right" />
        <AuthProvider>
          <App />
        </AuthProvider>
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>
);
