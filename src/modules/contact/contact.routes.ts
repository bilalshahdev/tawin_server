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

// indentation

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
 * responses:
 *   201:
 *     description: Message sent successfully
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 *             message:
 *               type: string
 *             data:
 *               $ref: '#/components/schemas/Contact'
 *   400:
 *     description: Validation error
 */
router.post('/', validate(contactValidation), contactController.submitContactForm);

export default router;