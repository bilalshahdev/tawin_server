import { Router } from "express";
import * as brandController from "./brand.controller";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";
import { upload } from "../../config/multer.config";
import { validate } from "../../middlewares/validate.middleware";
import { trackUploadedFiles } from "../../middlewares/trackUploadedFiles.middleware";
import { createBrandSchema, updateBrandSchema } from "./brand.validation";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Brand
 *   description: Brand management and retrieval
 */

/**
 * @swagger
 * /brands:
 *   get:
 *     summary: Get all brands with pagination and search
 *     tags: [Brand]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name (EN/AR)
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
 *         description: Brands retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: integer, example: 200 }
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Brands retrieved successfully" }
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Brand' }
 *                     meta:
 *                       type: object
 *                       properties:
 *                         totalDocs: { type: number }
 *                         totalPages: { type: number }
 *                         page: { type: number }
 *                         limit: { type: number }
 *   post:
 *     summary: Create a new brand (Admin Only)
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               "name[en]": { type: string }
 *               "name[ar]": { type: string }
 *               "description[en]": { type: string }
 *               "description[ar]": { type: string }
 *               image: { type: string, format: binary }
 *               isActive: { type: boolean }
 *     responses:
 *       201:
 *         description: Brand created successfully
 *       400:
 *         description: Validation Error or Brand already exists
 */
router.route("/")
    .get(brandController.getBrands)
    .post(
        authMiddleware,
        authorize("admin"),
        upload.single("image"),
        trackUploadedFiles,
        validate(createBrandSchema),
        brandController.createBrand
    );

/**
 * @swagger
 * /brands/{id}:
 *   get:
 *     summary: Get a single brand by ID
 *     tags: [Brand]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand retrieved successfully
 *       404:
 *         description: Brand not found
 *   patch:
 *     summary: Update a brand (Admin Only)
 *     tags: [Brand]
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
 *               "name[en]": { type: string }
 *               image: { type: string, format: binary }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *   delete:
 *     summary: Delete a brand (Admin Only)
 *     tags: [Brand]
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
 *         description: Brand deleted successfully
 */
router.route("/:id")
    .get(brandController.getBrand)
    .patch(
        authMiddleware,
        authorize("admin"),
        upload.single("image"),
        trackUploadedFiles,
        validate(updateBrandSchema),
        brandController.updateBrand
    )
    .delete(authMiddleware, authorize("admin"), brandController.deleteBrand);

export default router;