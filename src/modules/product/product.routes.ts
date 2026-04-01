import { Router } from "express";
import * as productController from "./product.controller";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as schemas from "./product.validation";

const router = Router();

router.get("/sync-reviews", productController.syncReviews);
// Public
router.get("/", productController.list);
router.get("/category/:categoryId", productController.getByCategory);
router.get("/slug/:slug", productController.getBySlug);
router.get("/:id", productController.getOne);

// Admin Only
router.post("/", authMiddleware, authorize('admin'), upload.single('image'), validate(schemas.createProductSchema), productController.create);
router.patch("/:id", authMiddleware, authorize('admin'), upload.single('image'), productController.update);
router.delete("/:id", authMiddleware, authorize('admin'), productController.remove);
router.patch(
    "/:id/stock",
    authMiddleware,
    authorize("admin"),
    validate(schemas.updateStockSchema),
    productController.updateStock
);

export default router;