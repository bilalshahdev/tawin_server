import { Router } from 'express';
import * as favoriteController from './favorite.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { toggleFavoriteSchema } from './favorite.validation';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /favorite:
 *   get:
 *     summary: Get my wishlist
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorite products
 *   post:
 *     summary: Toggle favorite (Add/Remove)
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully toggled
 */
router.get("/", favoriteController.list);
router.post("/", validate(toggleFavoriteSchema), favoriteController.toggle);

export default router;