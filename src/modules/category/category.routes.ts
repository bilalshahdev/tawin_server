import { Router } from "express";
import * as categoryController from "./category.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";
import { upload } from "../../config/multer.config";
import { trackUploadedFiles } from "../../middlewares/trackUploadedFiles.middleware";
import {
    createCategorySchema,
    updateCategorySchema,
} from "./category.validation";

const router = Router();

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category (Admin Only)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name[en]:
 *                 type: string
 *               name[ar]:
 *                 type: string
 *               description[en]:
 *                 type: string
 *               description[ar]:
 *                 type: string
 *               parentCategory:
 *                 type: string
 *               isActive:
 *                 type: string
 *                 enum: ["true", "false"]
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               icon:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Category created successfully
 */
router.post(
    "/",
    authMiddleware,
    authorize("admin"),
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "icon", maxCount: 1 },
    ]),
    trackUploadedFiles,
    validate(createCategorySchema),
    categoryController.createCategory
);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories (Tree Structure)
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of categories retrieved successfully
 */
router.get("/", categoryController.getCategories);

/**
 * @swagger
 * /categories/slug/{slug}:
 *   get:
 *     summary: Get category by slug
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details retrieved
 */
router.get("/slug/:slug", categoryController.getCategory);

/**
 * @swagger
 * /categories/id/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details retrieved
 */
router.get("/id/:id", categoryController.getCategoryById);

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Update a category (Admin Only)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name[en]:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               icon:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Category updated successfully
 */
router.patch(
    "/:id",
    authMiddleware,
    authorize("admin"),
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "icon", maxCount: 1 },
    ]),
    trackUploadedFiles,
    validate(updateCategorySchema),
    categoryController.updateCategory
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category (Admin Only)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 */
router.delete(
    "/:id",
    authMiddleware,
    authorize("admin"),
    categoryController.deleteCategory
);

export default router;