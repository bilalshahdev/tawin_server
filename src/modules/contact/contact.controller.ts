import { Request, Response } from 'express';
import * as contactService from './contact.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/apiResponse';
import { STATUS_CODE } from '../../config/constants';

export const submitContactForm = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id || null;
    const result = await contactService.createContactEntry(req.body, userId, req.language);
    return res.status(STATUS_CODE.CREATED).json(new ApiResponse("Message sent successfully", result));
});

export const getContacts = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await contactService.getContacts(page, limit);
    return res.status(STATUS_CODE.OK).json(new ApiResponse("Contacts fetched successfully", result));
});

export const deleteContactById = asyncHandler(async (req: Request, res: Response) => {
    const result = await contactService.deleteContact(req.params.id as string);
    return res.status(STATUS_CODE.OK).json(new ApiResponse("Contact deleted successfully", result));
});
