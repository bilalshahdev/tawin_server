import { commonSchemas } from './common.schemas';
import { authSchemas } from './auth.schemas';
import { userSchemas } from './user.schemas';
import { staffSchemas } from './staff.schemas';
import { notificationSchemas } from './notification.schemas';
import { addressSchemas } from './address.schemas';
import { catalogSchemas } from './catalog.schemas';
import { cartSchemas } from './cart.schemas';
import { couponSchemas } from './coupon.schemas';
import { orderSchemas } from './order.schemas';
import { reviewSchemas } from './review.schemas';
import { supplierSchemas } from './supplier.schemas';
import { settingsSchemas } from './settings.schemas';
import { contactSchemas } from './contact.schemas';

export const allSchemas = {
    ...commonSchemas,
    ...authSchemas,
    ...userSchemas,
    ...staffSchemas,
    ...notificationSchemas,
    ...addressSchemas,
    ...catalogSchemas,
    ...cartSchemas,
    ...couponSchemas,
    ...orderSchemas,
    ...reviewSchemas,
    ...supplierSchemas,
    ...settingsSchemas,
    ...contactSchemas,
};
