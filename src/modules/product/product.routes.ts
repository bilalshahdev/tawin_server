import { Router } from "express";
import * as productController from "./product.controller";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as schemas from "./product.validation";
import { trackUploadedFiles } from "../../middlewares/trackUploadedFiles.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product management and catalog
 */

/**
 * @swagger
 * /products/sync-reviews:
 *   get:
 *     summary: Sync all product ratings (Admin Only)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ratings synchronized successfully
 */
router.get("/sync-reviews", productController.syncReviews);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List all products with advanced filters
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title (EN/AR)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by Category ID
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
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
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get("/", productController.list);

/**
 * @swagger
 * /products/category/{categoryId}:
 *   get:
 *     summary: Get products by category ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/category/:categoryId", productController.getByCategory);

/**
 * @swagger
 * /products/slug/{slug}:
 *   get:
 *     summary: Get product by slug
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/slug/:slug", productController.getBySlug);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/:id", productController.getOne);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create product (Admin Only)
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title[en]:
 *                 type: string
 *               title[ar]:
 *                 type: string
 *               category:
 *                 type: string
 *                 description: Category ID
 *               price:
 *                 type: number
 *               description[en]:
 *                 type: string
 *               description[ar]:
 *                 type: string
 *               remainingPieces:
 *                 type: number
 *               isNewArrival:
 *                 type: boolean
 *               colors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of hex codes (e.g., #FF5733)
 *               sizes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [XS, S, M, L, XL, XXL]
 *               weights[0][unit]:
 *                 type: string
 *                 enum: [g, kg, ml, l]
 *               weights[0][value]:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post(
    "/",
    authMiddleware,
    authorize("admin"),
    upload.array("images", 10),
    trackUploadedFiles,
    validate(schemas.createProductSchema),
    productController.create
);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update product (Admin Only)
 *     tags: [Product]
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
 *               title[en]:
 *                 type: string
 *               price:
 *                 type: number
 *               remainingPieces:
 *                 type: number
 *               colors:
 *                 type: array
 *                 items:
 *                   type: string
 *               sizes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [XS, S, M, L, XL, XXL]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product updated
 */
router.patch(
    "/:id",
    authMiddleware,
    authorize("admin"),
    upload.array("images", 10),
    validate(schemas.updateProductSchema),
    productController.update
);

/**
 * @swagger
 * /products/{id}/stock:
 *   patch:
 *     summary: Manage product stock (Admin Only)
 *     tags: [Product]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *               isAddition:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Stock updated
 */
router.patch(
    "/:id/stock",
    authMiddleware,
    authorize("admin"),
    validate(schemas.updateStockSchema),
    productController.updateStock
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product (Admin Only)
 *     tags: [Product]
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
 *         description: Product deleted
 */
router.delete(
    "/:id",
    authMiddleware,
    authorize("admin"),
    productController.remove
);

export default router;