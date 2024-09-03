import express from "express";
import routerExpress from "./RouterExpress";
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", routerExpress);

export default app;
