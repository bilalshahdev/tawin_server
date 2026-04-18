import { Request, Response } from 'express';
import { STATUS_CODE } from '../../config/constants';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import * as settingsService from './settings.service';

export const getAppConfig = asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.getSettings();
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t('settings.settings_retrieved'), settings));
});

export const updateAppConfig = asyncHandler(async (req: Request, res: Response) => {
    let rawData = { ...req.body };
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const updateData: any = {};

    // 1. Process Text Fields - Only use Dot Notation for nested objects
    Object.keys(rawData).forEach((key) => {
        // Check if the key is a nested field like header[home][text]
        if (key.includes('[')) {
            const dbPath = key.replace(/\[/g, '.').replace(/\]/g, '');
            updateData[dbPath] = rawData[key];
        } else {
            // If it's a top-level field (like businessName), just set it
            updateData[key] = rawData[key];
        }
    });

    // 2. Process Files - Use Dot Notation here too
    if (files) {
        Object.keys(files).forEach((key) => {
            const dbPath = key.replace(/\[/g, '.').replace(/\]/g, '');
            updateData[dbPath] = files[key][0].path;
        });
    }

    // IMPORTANT: Check for and remove top-level conflicts
    // If we have "header.home.text", we must NOT have "header" as a top-level key
    if (updateData['header.home.text'] || updateData['header.home.image'] || updateData['header.shop.text'] || updateData['header.shop.image']) {
        delete updateData['header'];
    }

    const updated = await settingsService.updateSettings(updateData);

    res.status(200).json(
        new ApiResponse(req.t('settings.settings_updated'), updated)
    );
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