import { Router } from 'express';
import * as C from './settings.controller';
import { authMiddleware, authorize } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
    updateSettingsSchema,
    updateSocialLinksSchema,
    updatePagesSchema,
} from './settings.validation';
import { trackUploadedFiles } from '../../middlewares/trackUploadedFiles.middleware';

const router = Router();

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get public app branding and CMS data
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Configuration retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 */
router.get('/', C.getAppConfig);

// --- Admin Only Routes ---
router.use(authMiddleware, authorize('admin'));

const settingUploads = upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'contactFormImage', maxCount: 1 },
    { name: 'bottomSectionImage', maxCount: 1 },
    { name: 'header[landing_page][image]', maxCount: 1 },
    { name: 'header[home][image]', maxCount: 1 },
    { name: 'header[shop][image]', maxCount: 1 },
]);

/**
 * @swagger
 * /settings:
 *   patch:
 *     summary: Update all settings (General/CMS/Files)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               enableContactEmail:
 *                 type: boolean
 *               businessName[en]:
 *                 type: string
 *               businessName[ar]:
 *                 type: string
 *               tagline[en]:
 *                 type: string
 *               tagline[ar]:
 *                 type: string
 *               currency:
 *                 type: string
 *               currencySymbol:
 *                 type: string
 *               header[landing_page][text][en]:
 *                 type: string
 *               header[landing_page][text][ar]:
 *                 type: string
 *               header[landing_page][image]:
 *                 type: string
 *                 format: binary
 *               header[home][text][en]:
 *                 type: string
 *               header[home][text][ar]:
 *                 type: string
 *               header[home][image]:
 *                 type: string
 *                 format: binary
 *               header[shop][text][en]:
 *                 type: string
 *               header[shop][text][ar]:
 *                 type: string
 *               header[shop][image]:
 *                 type: string
 *                 format: binary
 *               logo:
 *                 type: string
 *                 format: binary
 *               pages[privacyPolicy][en]:
 *                 type: string
 *               pages[privacyPolicy][ar]:
 *                 type: string
 *               pages[termsAndConditions][en]:
 *                 type: string
 *               pages[termsAndConditions][ar]:
 *                 type: string
 *               pages[about][en]:
 *                 type: string
 *               pages[about][ar]:
 *                 type: string
 *               socialLinks[whatsapp]:
 *                 type: string
 *                 format: uri
 *               socialLinks[facebook]:
 *                 type: string
 *                 format: uri
 *               socialLinks[instagram]:
 *                 type: string
 *                 format: uri
 *               socialLinks[youtube]:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Updated
 */
router.patch('/', settingUploads, validate(updateSettingsSchema), trackUploadedFiles, C.updateAppConfig);

/**
 * @swagger
 * /settings/social-links:
 *   patch:
 *     summary: Update social links (Admin Only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SocialLinks'
 *     responses:
 *       200:
 *         description: Social links updated
 */
router.patch('/social-links', validate(updateSocialLinksSchema), C.updateSocialLinks);

/**
 * @swagger
 * /settings/pages:
 *   patch:
 *     summary: Update pages (Privacy, Terms, About)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pages'
 *     responses:
 *       200:
 *         description: Pages updated
 */

router.patch('/pages', validate(updatePagesSchema), C.updatePages);

export default router;