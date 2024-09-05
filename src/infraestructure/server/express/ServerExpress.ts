import express from "express";
import routerExpress from "./RouterExpress";
const cors = require("cors");

const app = express();

// Enable CORS (Cross-Origin Resource Sharing) to allow requests from different origins
app.use(cors());

// Parse incoming JSON requests and put the parsed data in `req.body`
app.use(express.json());

// Use the main router for all routes prefixed with "/api"
app.use("/api", routerExpress);

export default app;
