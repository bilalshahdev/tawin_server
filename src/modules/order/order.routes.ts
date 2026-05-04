import { Router } from 'express';
import * as orderController from './order.controller';
import { authMiddleware, authorize } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
    checkoutSchema,
    updateOrderStatusSchema,
    orderIdParamSchema,
} from './order.validation';

const router = Router();

/**
* @swagger
* /orders/stats:
*   get:
*     summary: Get order statistics (Admin only)
*     tags: [Order]
*     security: [{ bearerAuth: [] }]
*     responses:
*       200:
*         description: Order statistics retrieved successfully
*         content:
*           application/json:
*             schema:
*               allOf:
*                 - $ref: '#/components/schemas/ApiResponse'
*                 - type: object
*                   properties:
*                     data:
*                       $ref: '#/components/schemas/OrderStats'
* tags:
*   name: Order
*   description: Order management and checkout flow
*/

router.get(
    "/stats",
    authMiddleware,
    authorize('admin'),
    orderController.getOrderStats
);

/**
 * @swagger
 * /orders:
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
 *             required: [addressId]
 *             properties:
 *               addressId:
 *                 type: string
 *                 example: "65f1a2b3c4d5e6f7a8b9c0d1"
 *               shippingType:
 *                 type: string
 *                 enum: [free, express]
 *                 default: free
 *               paymentMethod:
 *                 type: string
 *                 enum: [COD]
 *                 default: COD
 *               couponCode:
 *                 type: string
 *                 example: "SAVE20"
 *               phone:
 *                 type: string
 *                 example: "+923001234567"
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
    .post(authMiddleware, validate(checkoutSchema), orderController.checkout);

/**
 * @swagger
 * /orders/{id}:
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
    .get(authMiddleware, validate(orderIdParamSchema), orderController.getOrder)
    .patch(authMiddleware, authorize('admin'), validate(updateOrderStatusSchema), orderController.changeStatus)
    .delete(authMiddleware, authorize('admin'), validate(orderIdParamSchema), orderController.removeOrder);

export default router;