import { Router } from "express";
import { authorize } from "../../middlewares/auth.middleware";
import * as C from "../user/user.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as schemas from "../admin/admin.validation";

const router = Router();

/**
 * @swagger
 * /admin:
 *   get:
 *     summary: Welcome to Admin API
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

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 */
router.get(
    "/users",
    authMiddleware,
    authorize("admin"),
    C.getAllUsers
);

/**
 * @swagger
 * /admin/users/{id}/verify:
 *   get:
 *     summary: Verify a user account (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f1c2a9e4b0c123456789ab
 *     responses:
 *       200:
 *         description: User verification status updated
 */
router.get(
    "/users/:id/verify",
    authMiddleware,
    authorize("admin"),
    validate(schemas.adminVerifySchema),
    C.verifyUser
);

/**
 * @swagger
 * /admin/construction-basket-requests:
 *   get:
 *     summary: Get all construction basket requests (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users who have applied for the basket
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
/**
 * @swagger
 * /admin/construction-basket-requests/{id}/status:
 *   patch:
 *     summary: Update status of a construction basket request (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f1c2a9e4b0c123456789ab
 *         description: The User ID
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
router.get(
    "/construction-basket-requests",
    authMiddleware,
    authorize("admin"),
    C.fetchAllBasketRequests
);

router.patch(
    "/construction-basket-requests/:id/status",
    authMiddleware,
    authorize("admin"),
    validate(schemas.updateBasketRequestStatusSchema),
    C.updateBasketRequestStatus
);

export default router;