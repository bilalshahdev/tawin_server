import { Router } from 'express';
import * as supplierController from './supplier.controller';
import { authMiddleware, authorize } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware, authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Supplier
 *   description: Admin-only management of suppliers and stock inflow
 */

/**
 * @swagger
 * /suppliers:
 *   get:
 *     summary: List all suppliers
 *     tags: [Supplier]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
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
 *                         $ref: '#/components/schemas/Supplier'
 *
 *   post:
 *     summary: Create a new supplier
 *     tags: [Supplier]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, phone]
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               phone:
 *                 type: string
 */
router
    .route('/')
    .get(supplierController.getAll)
    .post(supplierController.create);

/**
 * @swagger
 * /suppliers/add-stock:
 *   post:
 *     summary: Record delivery and increase product stock
 *     tags: [Supplier]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [supplier, product, quantity, unit]
 *             properties:
 *               supplier:
 *                 type: string
 *               product:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *                 enum: [piece, ton]
 */
router.post('/add-stock', supplierController.addStock);

/**
 * @swagger
 * /suppliers/{id}/history:
 *   get:
 *     summary: Get supplier delivery history
 *     tags: [Supplier]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
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
 *                         $ref: '#/components/schemas/SupplyLog'
 */
router.get('/:id/history', supplierController.getHistory);

router
    .route('/:id')
    .get(supplierController.getOne)
    .patch(supplierController.update)
    .delete(supplierController.remove);

export default router;