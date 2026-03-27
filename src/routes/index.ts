import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/user/user.routes";
import adminRoutes from "../modules/admin/admin.routes";

const router = Router();

// router.get("/", (req, res) => {
//     res.status(200).send({
//         status: "success",
//         message: "Welcome to Tawin API",
//     });
// });

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);

export default router;