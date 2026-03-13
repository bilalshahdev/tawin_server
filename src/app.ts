import express from "express";
import appRoutes from "./routes";
import { globalErrorHandler } from "./middlewares/error.middleware";

const app = express();

app.use(express.json());

app.use("/api/", appRoutes);

app.use(globalErrorHandler);

export default app;