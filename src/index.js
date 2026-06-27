import dotenv from "dotenv";
dotenv.config(
    {
        path:'./.env'
    }
);
import {app} from "./app.js";
import mongoose from "mongoose";
import{DB_NAME}  from "./constants.js";
import connectDB from "./db/index.js";
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 6000, () => {
      console.log(`Server is running on port ${process.env.PORT || 6000}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
  