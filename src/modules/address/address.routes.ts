import { Router } from "express";
import * as addressController from "./address.controller";
import * as schemas from "./address.validation";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Address
 *   description: User shipping and billing address management
 */

/**
 * @swagger
 * /addresses:
 *   get:
 *     summary: Get all addresses for current user
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
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
 *                         $ref: '#/components/schemas/Address'
 *   post:
 *     summary: Add a new address
 *     tags: [Address]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddressInput'
 *     responses:
 *       201:
 *         description: Created
 */
router.get("/", addressController.getMyAddresses);

router.post(
    "/",
    validate(schemas.createAddressSchema),
    addressController.addAddress
);

/**
 * @swagger
 * /addresses/{id}:
 *   patch:
 *     summary: Update an address
 *     tags: [Address]
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
 *             $ref: '#/components/schemas/AddressInput'
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Delete an address
 *     tags: [Address]
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
 *         description: Deleted
 */
router.patch(
    "/:id",
    validate(schemas.updateAddressSchema),
    addressController.updateAddress
);

router.delete("/:id", addressController.deleteAddress);

/**
 * @swagger
 * /addresses/{id}/default:
 *   patch:
 *     summary: Set an address as default
 *     tags: [Address]
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
 *         description: Default set
 */
router.patch("/:id/default", addressController.setDefaultAddress);

export default router;