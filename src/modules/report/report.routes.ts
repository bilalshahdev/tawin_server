import { Router } from "express";
import * as C from "./report.controller";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";

const router = Router();

/** 
 * @swagger
 * /reports:
 *   post:
 *     summary: Create a new report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "This product is not working"
 *     responses:
 *       201:
 *         description: Report created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

router.post("/", authMiddleware, authorize("customer"), C.createReport);
/** 
 * @swagger
 * /reports:
 *   get:
 *     summary: Get all reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.get("/", authMiddleware, authorize("admin"), C.getReports);
/** 
 * @swagger
 * /reports/{id}:
 *   delete:
 *     summary: Delete a report
 *     tags: [Reports]
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
 *         description: Report deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Report not found
 */

router.delete("/:id", authMiddleware, authorize("admin"), C.deleteReport);

export default router;