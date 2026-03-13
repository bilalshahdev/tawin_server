import express from "express";
import { Router } from "express";
import userRoutes from "../modules/user/user.routes"

const router = Router();
const app = express();

app.use("/users", userRoutes);

export default router