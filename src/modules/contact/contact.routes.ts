import { Router } from 'express';
import * as contactController from './contact.controller';
import { validate } from '../../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const contactValidation = z.object({
    body: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        message: z.string().min(1),
    }),
});

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Submit a contact form message
 *     tags: [Contact]
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
router.post('/', validate(contactValidation), contactController.submitContactForm);

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
router.get('/', contactController.getContacts);

export default router;