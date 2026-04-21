import { Router } from "express";
import * as C from "./user.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import * as schemas from "./user.validation";
import { upload } from "../../config/multer.config";
import { trackUploadedFiles } from "../../middlewares/trackUploadedFiles.middleware";

const router = Router();

/**
 * @swagger
 * /users:
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
    trackUploadedFiles,
    validate(schemas.updateProfileSchema),
    C.updateUser
);

/**
 * @swagger
 * /users/profile-picture:
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
    C.updateProfilePicture
);

/**
 * @swagger
 * /users/me:
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
 * /users/apply-for-basket:
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
 *             $ref: '#/components/schemas/ConstructionBasket'
 *     responses:
 *       201:
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