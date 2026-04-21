import { Router } from "express";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as userController from "../user/user.controller";
import * as adminSchemas from "./admin.validation";
import { authRateLimiter } from "../../middlewares/rateLimiter.middleware";
import * as authController from "../auth/auth.controller";
import * as authSchemas from "../auth/auth.validation";
import * as adminController from "./admin.controller";
import { upload } from "../../config/multer.config";
import { updateAdminProfileSchema } from "../user/user.validation";
import { trackUploadedFiles } from "../../middlewares/trackUploadedFiles.middleware";

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

// admin profile update api

/** 
 * @swagger
 * /admin/profile:
 *   patch:
 *     summary: Update admin profile (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.patch("/profile", upload.fields([{ name: 'profilePicture', maxCount: 1 }]), trackUploadedFiles, validate(updateAdminProfileSchema), adminController.updateAdminProfile);

// swagger apis
// also filter in query too, like filter= daily/weekly/monthly

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get stats (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: Filter type
 *     responses:
 *       200:
 *         description: Stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get("/stats", adminController.getStats);
/**
 * @swagger
 * /admin/sales-report:
 *   get:
 *     summary: Get sales report (Admin Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: Filter type
 *     responses:
 *       200:
 *         description: Sales report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get("/sales-report", adminController.getSalesReport);
/**
 * @swagger
 * /admin/sales-by-region:
 *   get:
 *     summary: Get sales by region (Admin Only)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: Filter type
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales by region retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get("/sales-by-region", adminController.getSalesByRegion);
/**
 * @swagger
 * /admin/top-categories:
 *   get:
 *     summary: Get top categories (Admin Only)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: Filter type
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get("/top-categories", adminController.getTopCategories);

/**
 * @swagger
 * /admin/financial-stats:
 *   get:
 *     summary: Get financial stats (Admin Only)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly, all-time]
 *         description: Filter type
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get("/financial-stats", adminController.getFinancialStats);

/**
 * @swagger
 * /admin/financials:
 *   get:
 *     summary: Get financials (Admin Only)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: Filter type
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financials retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get("/financials", adminController.getFinancials);
/**
 * @swagger
 * /admin/top-products:
 *   get:
 *     summary: Get top products (Admin Only)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: Filter type
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get("/top-products", adminController.getTopProducts);
/**
 * @swagger
 * /admin/summary:
 *   get:
 *     summary: Get dashboard summary (Admin Only)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: Filter type
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get("/summary", adminController.getDashboardSummary);

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