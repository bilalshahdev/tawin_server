import { Router } from "express";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as userController from "../user/user.controller";
import * as adminSchemas from "./admin.validation";
import { authRateLimiter } from "../../middlewares/rateLimiter.middleware";
import * as authController from "../auth/auth.controller";
import * as authSchemas from "../auth/auth.validation";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: System management and administrative workflows
 */

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Admin API status check
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Success message
 */
router.get("/", (req, res) => {
    res.status(200).send({
        status: "success",
        message: "Welcome to Admin API",
    });
});

// All routes below this line require Admin privileges
router.use(authMiddleware, authorize("admin"));

// ==========================================
// USER MANAGEMENT
// ==========================================

/**
 * @swagger
 * /admin/users/register:
 *   post:
 *     summary: Register a new user by admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegister'
 *     responses:
 *       201:
 *         description: Admin registered a new user successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post("/users/register", authRateLimiter, authMiddleware, authorize("admin"), validate(authSchemas.registerSchema), authController.register);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all registered users (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
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
 *                         $ref: '#/components/schemas/User'
 */
router.get("/users", userController.getAllUsers);

/**
 * @swagger
 * /admin/users/{id}/verify:
 *   patch:
 *     summary: Manually verify/unverify a user account (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The User ID
 *     responses:
 *       200:
 *         description: User verification status updated
 */
router.patch(
    "/users/:id/verify",
    validate(adminSchemas.adminVerifySchema),
    userController.verifyUser
);

// ==========================================
// CONSTRUCTION BASKET MANAGEMENT
// ==========================================


// add query params: page, limit, search
/**
 * @swagger
 * /admin/construction-basket-requests:
 *   get:
 *     summary: Fetch all construction basket applications (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of basket applications
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
 *                         $ref: '#/components/schemas/BasketRequest'
 */
router.get(
    "/construction-basket-requests",
    userController.fetchAllBasketRequests
);

/**
 * @swagger
 * /admin/construction-basket-requests/{id}/status:
 *   patch:
 *     summary: Update the status of a basket request (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The User ID who applied
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Request status updated successfully
 */
router.patch(
    "/construction-basket-requests/:id/status",
    validate(adminSchemas.updateBasketRequestStatusSchema),
    userController.updateBasketRequestStatus
);

/**
 * @swagger
 * /admin/construction-basket-requests/{id}:
 *   delete:
 *     summary: Delete a basket request (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The User ID who applied
 *     responses:
 *       200:
 *         description: Request deleted successfully
 */
router.delete(
    "/construction-basket-requests/:id",
    userController.deleteConstructionBasket
);

export default router;