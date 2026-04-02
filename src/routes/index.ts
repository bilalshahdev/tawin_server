import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/user/user.routes";
import adminRoutes from "../modules/admin/admin.routes";
import productRoutes from "../modules/product/product.routes";
import categoryRoutes from "../modules/category/category.routes";
import reviewRoutes from "../modules/review/review.routes";
import favoriteRoutes from "../modules/favorite/favorite.routes";
import settingsRoutes from "../modules/settings/settings.routes";

const router = Router();
router.use("/users", userRoutes);

router.get("/", (req, res) => {
    res.status(200).send({
        status: "success",
        message: req.t("general.welcome"),
    });
});

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/reviews", reviewRoutes);
router.use("/favorite", favoriteRoutes);

router.use("/settings", settingsRoutes);

export default router;