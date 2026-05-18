import { Router } from 'express';
import * as contactController from './contact.controller';
import { validate } from '../../middlewares/validate.middleware';
import { z } from 'zod';
import { authMiddleware, authorize } from '../../middlewares/auth.middleware';
import { authRateLimiter } from '../../middlewares/rateLimiter.middleware';

const router = Router();

const contactValidation = z.object({
    body: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        message: z.string().min(1),
    }),
});

// post contact is portected, customer will be doing it

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Submit a contact form message
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contact'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Validation error
 */
router.post('/', authMiddleware, authorize('customer'), authRateLimiter, validate(contactValidation), contactController.submitContactForm);

/**
 * @swagger
 * /contact:
 *   get:
 *     summary: Get contacts
 *     tags: [Contact]
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
 *         description: Limit per page
 *     responses:
 *       200:
 *         description: Contacts fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Validation error
 */
router.get('/', authMiddleware, authorize('admin'), contactController.getContacts);

/**
 * @swagger
 * /contact/{id}:
 *   delete:
 *     summary: Delete a contact by ID
 *     tags: [Contact]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact ID
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Validation error
 */
router.delete('/:id', contactController.deleteContactById);

export default router;