import { Router } from 'express';
import * as supplierController from './supplier.controller';
import { authMiddleware, authorize } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createSupplierSchema, addStockSchema } from './supplier.validation';

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
 * /suppliers/stats:
 *   get:
 *     summary: Get dashboard statistics for suppliers and procurement
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Period'
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                         totalSuppliers:
 *                           type: number
 *                           example: 10
 *                         totalSpend:
 *                           type: number
 *                           example: 5000.50
 *                         totalItemsProcured:
 *                           type: number
 *                           example: 1200
 *                         graphData:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               label:
 *                                 type: string
 *                                 example: "22 Apr"
 *                               spend:
 *                                 type: number
 *                                 example: 450.00
 *                               items:
 *                                 type: number
 *                                 example: 100
 */
router.get('/stats', supplierController.getStats);

/**
 * @swagger
 * /suppliers:
 *   get:
 *     summary: List all suppliers
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
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
 */
router.get('/', supplierController.getAll);

/**
 * @swagger
 * /suppliers:
 *   post:
 *     summary: Create a new supplier
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
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
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Supplier created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Supplier'
 */
router.post('/', validate(createSupplierSchema), supplierController.create);


// body: z.object({
//     supplier: z.string().min(1, "Supplier ID is required"),
//     product: z.string().min(1, "Product ID is required"),
//     supplierQuantity: z.number().positive("Supplier quantity is required"),
//     supplierUnit: z.enum(['piece', 'ton']),
//     costPrice: z.number().positive("Cost price is required"),
//     sacksCount: z.number().optional(),
//     note: z.string().optional(),
// }),
/**
 * @swagger
 * /suppliers/add-stock:
 *   post:
 *     summary: Record delivery and increase product stock
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [supplier, product, supplierQuantity, supplierUnit, costPrice]
 *             properties:
 *               supplier:
 *                 type: string
 *               product:
 *                 type: string
 *               supplierQuantity:
 *                 type: number
 *               costPrice:
 *                 type: number
 *               supplierUnit:
 *                 type: string
 *                 enum: [piece, ton]
 *     responses:
 *       201:
 *         description: Stock added successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SupplyLog'
 */
router.post('/add-stock', validate(addStockSchema), supplierController.addStock);

/**
 * @swagger
 * /suppliers/{id}/history:
 *   get:
 *     summary: Get supplier delivery history
 *     tags: [Supplier]
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

/**
 * @swagger
 * /suppliers/{id}:
 *   get:
 *     summary: Get supplier by ID
 *     tags: [Supplier]
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
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Supplier'
 */
router.get('/:id', supplierController.getOne);

/**
 * @swagger
 * /suppliers/{id}:
 *   patch:
 *     summary: Update supplier profile
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               isActive:
 *                 type: boolean
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
 *                       $ref: '#/components/schemas/Supplier'
 */
router.patch('/:id', supplierController.update);

/**
 * @swagger
 * /suppliers/{id}:
 *   delete:
 *     summary: Delete a supplier
 *     tags: [Supplier]
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
 *         description: Supplier deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete('/:id', supplierController.remove);

export default router;