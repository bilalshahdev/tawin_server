import { Router } from "express";
import * as C from "./staff.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";
import * as schemas from "./staff.validation";
import { upload } from "../../config/multer.config";
import { trackUploadedFiles } from "../../middlewares/trackUploadedFiles.middleware";

const router = Router();

/**
 * @swagger
 * /staff:
 *   post:
 *     summary: Create a new staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStaff'
 *     responses:
 *       201:
 *         description: Staff created successfully
 */
router.post(
    "/",
    authMiddleware,
    authorize("admin"),
    validate(schemas.createStaffSchema),
    C.createStaff
);

/**
 * @swagger
 * /staff/stats:
 *   get:
 *     summary: Get staff statistics (Total, Active, Inactive)
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Period'
 *     responses:
 *       200:
 *         description: Staff statistics retrieved successfully
 */
router.get(
    "/stats",
    authMiddleware,
    authorize("admin"),
    C.getStaffStats
);

/**
 * @swagger
 * /staff:
 *   get:
 *     summary: Get all staff members
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of staff retrieved
 */
router.get(
    "/",
    authMiddleware,
    authorize("admin"),
    C.getAllStaff
);

/**
 * @swagger
 * /staff/{id}:
 *   get:
 *     summary: Get specific staff details
 *     tags: [Staff]
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
 *         description: Staff details retrieved
 */
router.get(
    "/:id",
    authMiddleware,
    authorize("admin"),
    C.getStaffById
);

/**
 * @swagger
 * /staff/{id}:
 *   patch:
 *     summary: Update staff info and permissions
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStaff'
 *     responses:
 *       200:
 *         description: Staff updated successfully
 */
router.patch(
    "/:id",
    authMiddleware,
    authorize("admin"),
    upload.fields([{ name: "profileImage", maxCount: 1 }]),
    trackUploadedFiles,
    validate(schemas.updateStaffPermissionsSchema),
    C.updateStaff
);

/**
 * @swagger
 * /staff/{id}/toggle-status:
 *   patch:
 *     summary: Toggle staff isActive status
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status toggled successfully
 */
router.patch(
    "/:id/toggle-status",
    authMiddleware,
    authorize("admin"),
    C.toggleStaffStatus
);

/**
 * @swagger
 * /staff/{id}:
 *   delete:
 *     summary: Delete a staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff deleted successfully
 */
router.delete(
    "/:id",
    authMiddleware,
    authorize("admin"),
    C.deleteStaff
);

export default router;