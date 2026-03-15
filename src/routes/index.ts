import { Router } from "express";
import userRoutes from "../modules/user/user.routes";
import authRoutes from "../modules/auth/auth.routes";

const router = Router();

// router.get("/", (req, res) => {
//     res.status(200).send({
//         status: "success",
//         message: "Welcome to Tawin API",
//     });
// });

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;