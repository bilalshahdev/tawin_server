import { Router } from "express";
import * as C from "./user.controller";
import { upload } from "../../middlewares/upload.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";
import * as schemas from "./user.validation";

const router = Router();

router.patch(
    "/",
    authMiddleware,
    upload.fields([{ name: "profileImage", maxCount: 1 }]),
    validate(schemas.updateProfileSchema),
    C.updateUser
);

router.patch(
    "/profile-picture",
    authMiddleware,
    upload.fields([{ name: "profileImage", maxCount: 1 }]),
    C.updateUser
);

router.get(
    "/me",
    authMiddleware,
    C.getUser
);

// apply for basket
router.post(
    "/apply-for-basket",
    authMiddleware,
    validate(schemas.applyForBasketSchema),
    C.applyForBasket
);


export default router;