export const API = `${
  import.meta.env.VITE_NODE_ENV === "development"
    ? import.meta.env.VITE_DEVELOPMENT_URL
    : import.meta.env.VITE_BASE_URL
}`;
