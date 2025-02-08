import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const qureyCline = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Provider store={store}>
      <QueryClientProvider client={qureyCline}>
        <App />
      </QueryClientProvider>
    </Provider>
  </BrowserRouter>
);
