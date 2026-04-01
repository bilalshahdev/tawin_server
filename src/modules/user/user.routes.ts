import { Router } from "express";
import * as C from "./user.controller";
import { upload } from "../../middlewares/upload.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as schemas from "./user.validation";

const router = Router();

/**
 * @swagger
 * /user:
 *   patch:
 *     summary: Update current user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.patch(
    "/",
    authMiddleware,
    upload.fields([{ name: "profileImage", maxCount: 1 }]),
    validate(schemas.updateProfileSchema),
    C.updateUser
);

/**
 * @swagger
 * /user/profile-picture:
 *   patch:
 *     summary: Update profile picture only
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 */
router.patch(
    "/profile-picture",
    authMiddleware,
    upload.fields([{ name: "profileImage", maxCount: 1 }]),
    C.updateUser
);

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current user profile information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 */
router.get(
    "/me",
    authMiddleware,
    C.getUser
);

/**
 * @swagger
 * /user/apply-for-basket:
 *   post:
 *     summary: Apply for the construction basket feature
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullRegistrationName
 *               - phoneNumber
 *               - occupation
 *               - unifiedCard
 *               - residenceCard
 *               - propertyArea
 *               - propertyType
 *             properties:
 *               fullRegistrationName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               monthlyIncome:
 *                 type: number
 *               occupation:
 *                 type: string
 *               unifiedCard:
 *                 type: string
 *               residenceCard:
 *                 type: string
 *               propertyArea:
 *                 type: string
 *               propertyType:
 *                 type: string
 *                 enum: [Freehold, Leasehold]
 *               country:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post(
    "/apply-for-basket",
    authMiddleware,
    validate(schemas.applyForBasketSchema),
    C.applyForBasket
);

export default router;