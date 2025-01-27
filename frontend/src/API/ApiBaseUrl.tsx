export const API = `${
  import.meta.env.VITE_NODE_ENV === "development"
    ? import.meta.env.VITE_DEVELOPMENT_URL
    : "https://ocp-api.vercel.app"
}`;
