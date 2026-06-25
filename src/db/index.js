import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";
import express from "express";
const app = express();
const connectDB = async () => {
    try{
      const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
      app.on("error",(error)=>{
        console.log("Error in MongoDB connection:",error);
      })
      console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
      app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port : ${process.env.PORT}`);
      } )
    }
    catch (error) {
      console.error("Error connecting to MongoDB:", error);
      process.exit(1); // Exit the process with an error code
    }


}
export default connectDB;