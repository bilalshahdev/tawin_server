import { Router } from "express";
import * as categoryController from "./category.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";
import { createCategorySchema, updateCategorySchema } from "./category.validation";

const router = Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by category name (EN or AR)
 *     responses:
 *       200:
 *         description: List of categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get("/", categoryController.getCategories);

/**
 * @swagger
 * /categories/{slug}:
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
 *         description: Category details retrieved successfully
 *       404:
 *         description: Category not found
 */
router.get("/:slug", categoryController.getCategory);

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
 *                 example: Construction Material
 *               name[ar]:
 *                 type: string
 *                 example: مواد البناء
 *               description[en]:
 *                 type: string
 *               description[ar]:
 *                 type: string
 *               parent:
 *                 type: string
 *                 description: ID of the parent category
 *               isActive:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 default: "true"
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
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "icon", maxCount: 1 },
    ]),
    authMiddleware,
    authorize("admin"),
    validate(createCategorySchema),
    categoryController.createCategory
);

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
 *               name[ar]:
 *                 type: string
 *               description[en]:
 *                 type: string
 *               description[ar]:
 *                 type: string
 *               parentCategory:
 *                 type: string
 *                 description: ID of the parent category
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