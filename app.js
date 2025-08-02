import "dotenv/config";
import express from "express";
import logger from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import orgRoutes from "./routes/organization.router.js"
import connectWithRetry from './db/mongoose-connection.js';

const app = express();

connectWithRetry()
app.use(logger("dev"))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }));
app.use(cors());


app.use("/", orgRoutes);

app.listen("3004", ()=>{
    console.log("👷🏽‍♂️ Organization Working on 3004 ...")
})