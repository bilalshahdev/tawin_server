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
 * /reviews:
 *   get:
 *     summary: Get all reviews for moderation (Admin Only)
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all reviews retrieved
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
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 */
router.get(
    "/product/:productId",
    validate(getProductReviewsSchema),
    reviewController.getProductReviews
);

// Authentication required for routes below (Public but needs login)
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
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       201:
 *         description: Review created successfully
 */
router.post(
    "/",
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
 */
router.delete("/:id", reviewController.removeReview);

export default router;