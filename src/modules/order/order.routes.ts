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
 *   /**
 * @swagger
 * /order:
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
 *             required: [addressId]
 *             properties:
 *               addressId:
 *                 type: string
 *                 example: "65f1a2b3c4d5e6f7a8b9c0d1"
 *                 description: The ID of the saved address from the user's address book
 *               paymentMethod:
 *                 type: string
 *                 enum: [COD]
 *                 default: COD
 *                 description: Preferred payment method (Currently only COD supported)
 *               couponCode:
 *                 type: string
 *                 example: "SAVE20"
 *                 description: Optional discount coupon code
 *               phone:
 *                 type: string
 *                 example: "+923001234567"
 *                 description: Optional override for the phone number; defaults to the address phone if blank
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
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