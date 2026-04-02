import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as settingsService from './settings.service';
import { ApiResponse } from '../../utils/apiResponse';
import { STATUS_CODE } from '../../config/constants';
import set from 'lodash/set';

export const getAppConfig = asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.getSettings();
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t('settings.settings_retrieved'), settings));
});

export const updateAppConfig = asyncHandler(async (req: Request, res: Response) => {
    let updateData = { ...req.body };
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // 1. Map Files to Nested Paths
    if (files) {
        Object.keys(files).forEach((key) => {
            // Logic: 'header[home][image]' becomes 'header.home.image'
            const dbPath = key.replace(/\[/g, '.').replace(/\]/g, '');
            set(updateData, dbPath, files[key][0].path);
        });
    }

    // 2. Fix nested objects that come as flat strings from Multipart-form
    // Example: "businessName[en]" -> { businessName: { en: "..." } }
    Object.keys(updateData).forEach(key => {
        if (key.includes('[')) {
            const dbPath = key.replace(/\[/g, '.').replace(/\]/g, '');
            set(updateData, dbPath, updateData[key]);
            delete updateData[key];
        }
    });

    const updated = await settingsService.updateSettings(updateData);
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t('settings.settings_updated'), updated));
});

export const updateSocialLinks = asyncHandler(async (req: Request, res: Response) => {
    const updated = await settingsService.updateSettings({
        socialLinks: req.body
    });

    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t('settings.social_links_updated'), updated));
});

export const updatePages = asyncHandler(async (req: Request, res: Response) => {
    const updated = await settingsService.updateSettings({
        pages: req.body
    });

    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t('settings.pages_updated'), updated));
});