import dotenv from "dotenv";

const env = dotenv.config().parsed;

export default {
  build: {
    sourcemap: true,
  },
  define: {
    "process.env": env,
  },
};
