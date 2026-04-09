import { Router } from "express";
import * as cartController from "./cart.controller";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { cartItemSchema } from "./cart.validation";

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

/**
 * @swagger
 * /cart/all:
 *   get:
 *     summary: Get all carts (Admin Only)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/all", authorize("admin"), cartController.getAllCarts);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: View my cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Cart"
 *   post:
 *     summary: Add item to cart
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
 *         description: Added
 */
router.get("/", cartController.getCart);
router.post("/", validate(cartItemSchema), cartController.addItem);

/**
 * @swagger
 * /cart/quantity:
 *   patch:
 *     summary: Update quantity
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
 *         description: Updated
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
 *     summary: Remove specific variant
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RemoveCartItem"
 *     responses:
 *       200:
 *         description: Removed
 */
router.delete("/remove", cartController.removeItem);

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Clear cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleared
 */
router.delete("/clear", cartController.clearCart);

export default router;