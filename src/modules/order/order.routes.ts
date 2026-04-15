import { Router } from 'express';
import * as orderController from './order.controller';
import { authMiddleware, authorize } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order management and checkout flow
 */

/**
 * @swagger
 * /order:
 *   get:
 *     summary: List orders (Admin sees all, Customer sees their own)
 *     tags: [Order]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/acceptLanguage'
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *         description: Filter by order status
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
 *         description: Orders list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     meta:
 *                       $ref: '#/components/schemas/Pagination'
 *
 *   post:
 *     summary: Place a new order (Checkout)
 *     tags: [Order]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shippingAddress, phone]
 *             properties:
 *               shippingAddress:
 *                 type: string
 *                 example: "123 Street, City, Country"
 *               phone:
 *                 type: string
 *                 example: "+923001234567"
 *               couponCode:
 *                 type: string
 *                 example: "SAVE20"
 *     responses:
 *       201:
 *         description: Order placed successfully
 */
router
    .route('/')
    .get(authMiddleware, orderController.listOrders)
    .post(authMiddleware, orderController.checkout);

/**
 * @swagger
 * /order/{id}:
 *   get:
 *     summary: Get order details
 *     tags: [Order]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details fetched
 *
 *   patch:
 *     summary: Update order status (Admin Only)
 *     tags: [Order]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *
 *   delete:
 *     summary: Delete order (Admin Only)
 *     tags: [Order]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted successfully
 */
router
    .route('/:id')
    .get(authMiddleware, orderController.getOrder)
    .patch(authMiddleware, authorize('admin'), orderController.changeStatus)
    .delete(authMiddleware, authorize('admin'), orderController.removeOrder);

export default router;