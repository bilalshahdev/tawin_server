import { Router } from 'express';
import * as couponController from './coupon.controller';
import { authMiddleware, authorize } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
    createCouponSchema,
    validateCouponSchema,
} from './coupon.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Coupon
 *   description: Coupon management for Admin and validation for Users
 */

// --- Admin Routes ---

/**
 * @swagger
 * /coupons/admin:
 *   get:
 *     summary: Get all coupons (Admin)
 *     description: Retrieve a paginated list of coupons with optional search by code.
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguage'
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by coupon code (case-insensitive)
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
 *         description: Successfully retrieved coupons
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         coupons:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Coupon'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                             page:
 *                               type: integer
 *                             limit:
 *                               type: integer
 *                             pages:
 *                               type: integer
 *   post:
 *     summary: Create a new percentage coupon (Admin)
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Coupon'
 *     responses:
 *       201:
 *         description: Coupon created successfully
 */
router
    .route('/admin')
    .get(authMiddleware, authorize('admin'), couponController.getAdminCoupons)
    .post(
        authMiddleware,
        authorize('admin'),
        validate(createCouponSchema),
        couponController.adminCreateCoupon,
    );

/**
 * @swagger
 * /coupons/admin/stats:
 *   get:
 *     summary: Get coupon statistics (Admin)
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CouponStats'
 */
router.get(
    '/admin/stats',
    authMiddleware,
    authorize('admin'),
    couponController.getStats,
);

// --- User Routes ---

/**
 * @swagger
 * /coupons/validate:
 *   post:
 *     summary: Validate coupon and calculate discount (User)
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, amount]
 *             properties:
 *               code:
 *                 type: string
 *                 example: "SAVE20"
 *               amount:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         coupon:
 *                           $ref: '#/components/schemas/Coupon'
 *                         discountAmount:
 *                           type: number
 *                           example: 100
 */
router.post(
    '/validate',
    authMiddleware,
    validate(validateCouponSchema),
    couponController.userCheckCoupon,
);

/**
 * @swagger
 * /coupons/admin/{id}:
 *   patch:
 *     summary: Update coupon details (Admin)
 *     tags: [Coupon]
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
 *         description: Coupon updated successfully
 *       404:
 *         description: Coupon not found
 *   delete:
 *     summary: Delete a coupon (Admin)
 *     tags: [Coupon]
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
 *         description: Coupon deleted successfully
 *       404:
 *         description: Coupon not found
 */
router
    .route('/admin/:id')
    .patch(authMiddleware, authorize('admin'), couponController.updateCoupon)
    .delete(authMiddleware, authorize('admin'), couponController.deleteCoupon);

/**
 * @swagger
 * /coupons/admin/toggle-status/{id}:
 *   patch:
 *     summary: Toggle coupon active/inactive status (Admin)
 *     tags: [Coupon]
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
 *         description: Coupon status toggled successfully
 *       404:
 *         description: Coupon not found
 */
router.patch(
    '/admin/toggle-status/:id',
    authMiddleware,
    authorize('admin'),
    couponController.toggleStatus,
);

export default router;