import { Router } from "express";
import * as reviewController from "./review.controller";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
    createReviewSchema,
    getProductReviewsSchema,
} from "./review.validation";

const router = Router();

/**
 * @swagger
 * /reviews/stats:
 *   get:
 *     summary: Get review statistics for dashboard
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Period'
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 * 
 */
router.get(
    "/stats",
    authMiddleware,
    authorize("admin"),
    reviewController.getReviewDashboard
);

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Get all reviews for moderation (Admin Only)
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         description: Filter reviews by rating
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
 *         description: List of all reviews retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get(
    "/",
    authMiddleware,
    authorize("admin"),
    reviewController.getAllReviews
);

/**
 * @swagger
 * /reviews/product/{productId}:
 *   get:
 *     summary: Get all reviews for a specific product
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get(
    "/product/:productId",
    validate(getProductReviewsSchema),
    reviewController.getProductReviews
);

router.use(authMiddleware);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post(
    "/",
    authMiddleware,
    authorize("customer"),
    validate(createReviewSchema),
    reviewController.createReview
);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Review]
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
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete("/:id", authMiddleware, authorize("admin"), reviewController.removeReview);

export default router;