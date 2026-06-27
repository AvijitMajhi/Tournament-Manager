import dotenv from "dotenv";
dotenv.config(
    {
        path:'./.env'
    }
);

import mongoose from "mongoose";
import{DB_NAME}  from "./constants.js";
import connectDB from "./db/index.js";
connectDB()
.then(()=>{
app.listen(process.env.PORT || 8000,()=>{
    console.log(`Server is running on port : ${process.env.PORT}`);
})
.catch((error)=>{
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit the process with an error code
})