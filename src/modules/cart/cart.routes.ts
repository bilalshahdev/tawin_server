import { Router } from "express";
import * as cartController from "./cart.controller";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { cartItemSchema } from "./cart.validation";

const router = Router();

// All cart routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management for users
 */

/**
 * @swagger
 * /cart/all:
 *   get:
 *     summary: Get all carts in the system (Admin Only)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all user carts
 */
router.get("/all", authorize("admin"), cartController.getAllCarts);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: View my shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Cart"
 *   post:
 *     summary: Add an item to the cart (or increment quantity if exists)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CartItem"
 *     responses:
 *       200:
 *         description: Item added successfully
 */
router.get("/", cartController.getCart);
router.post("/", validate(cartItemSchema), cartController.addItem);

/**
 * @swagger
 * /cart/quantity:
 *   patch:
 *     summary: Update the specific quantity of an item
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CartItem"
 *     responses:
 *       200:
 *         description: Quantity updated
 */
router.patch(
    "/quantity",
    validate(cartItemSchema),
    cartController.updateQuantity
);

/**
 * @swagger
 * /cart/remove:
 *   delete:
 *     summary: Remove a specific item/variant from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               attributes:
 *                 type: object
 *     responses:
 *       200:
 *         description: Item removed
 */
router.delete("/remove", cartController.removeItem);

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Empty the entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.delete("/clear", cartController.clearCart);

export default router;