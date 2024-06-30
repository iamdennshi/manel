import dotenv from "dotenv";

const env = dotenv.config().parsed;

export default {
  build: {
    sourcemap: true,
  },
  base: "/manel/",
  define: {
    "process.env": env,
  },
};
