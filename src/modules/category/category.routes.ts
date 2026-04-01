import { Router } from "express";
import * as categoryController from "./category.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";
import { createCategorySchema } from "./category.validation";

const router = Router();

// Public Routes
router.get("/", categoryController.getCategories);
router.get("/:slug", categoryController.getCategory);

// Admin Only Routes
router.use(authMiddleware, authorize("admin"));

router.post(
    "/",
    upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'icon', maxCount: 1 }]),
    validate(createCategorySchema),
    categoryController.createCategory
);

export default router;