import mongoose from "mongoose";
import app from "./app";
import { config } from "./config";

mongoose.connect(config.mongoUri).then(() => {
    console.log("Mongo connected");

    app.listen(config.port, () => {
        console.log(`Server running on ${config.port}`);
    });
});