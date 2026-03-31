import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/user/user.routes";
import adminRoutes from "../modules/admin/admin.routes";
import productRoutes from "../modules/product/product.routes";

const router = Router();
router.use("/users", userRoutes);

router.get("/", (req, res) => {
    res.status(200).send({
        status: "success",
        message: "Welcome to Tawin API",
    });
});

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/products", productRoutes);

export default router;