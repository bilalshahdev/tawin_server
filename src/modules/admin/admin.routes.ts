import { Router } from "express";
import { authorize } from "../../middlewares/auth.middleware";
import * as C from "../user/user.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import * as schemas from "../admin/admin.validation";

const router = Router();

router.get("/", (req, res) => {
    res.status(200).send({
        status: "success",
        message: "Welcome to Admin API",
    });
});

router.get(
    "/users",
    authMiddleware,
    authorize("admin"),
    C.getAllUsers
);

router.get(
    "/users/:id/verify",
    authMiddleware,
    authorize("admin"),
    validate(schemas.adminVerifySchema),
    C.verifyUser
);

router.get(
    "/construction-basket-requests",
    authMiddleware,
    authorize("admin"),
    C.fetchAllBasketRequests
);

router.patch(
    "/construction-basket-requests/:id/status",
    authMiddleware,
    authorize("admin"),
    validate(schemas.updateBasketRequestStatusSchema),
    C.updateBasketRequestStatus
);


export default router;