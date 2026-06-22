import { Request, Response } from 'express';
import { STATUS_CODE } from '../../config/constants';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import * as settingsService from './settings.service';

const flattenForDotUpdate = (source: any, prefix = '', target: Record<string, any> = {}) => {
    Object.keys(source || {}).forEach((key) => {
        const value = source[key];
        const normalizedKey = key.replace(/\[/g, '.').replace(/\]/g, '');
        const path = prefix ? `${prefix}.${normalizedKey}` : normalizedKey;

        if (
            value &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            !(value instanceof Date)
        ) {
            flattenForDotUpdate(value, path, target);
            return;
        }

        target[path] = value;
    });

    return target;
};

export const getAppConfig = asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.getSettings();
    res.status(STATUS_CODE.OK).json(new ApiResponse(req.t('settings.retrieved'), settings));
});

export const updateAppConfig = asyncHandler(async (req: Request, res: Response) => {
    const rawData = { ...req.body };
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const updateData = flattenForDotUpdate(rawData);

    if (files) {
        Object.keys(files).forEach((key) => {
            if (files[key]?.[0]) {
                const dbPath = key.replace(/\[/g, '.').replace(/\]/g, '');
                updateData[dbPath] = files[key][0].path;
            }
        });
    }

    const updated = await settingsService.updateSettings(updateData);

    res.status(200).json(
        new ApiResponse(req.t('settings.updated'), updated)
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
