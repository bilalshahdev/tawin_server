import { Request, Response } from 'express';
import * as contactService from './contact.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/apiResponse';
import { STATUS_CODE } from '../../config/constants';

export const submitContactForm = asyncHandler(async (req: Request, res: Response) => {
    const result = await contactService.createContactEntry(req.body, req.language);
    return res.status(STATUS_CODE.CREATED).json(new ApiResponse("Message sent successfully", result));
});