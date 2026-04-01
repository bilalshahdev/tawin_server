import { Router } from "express";
import * as reviewController from "./review.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createReviewSchema, getProductReviewsSchema } from "./review.validation";

const router = Router();

router.get("/product/:productId", validate(getProductReviewsSchema), reviewController.getProductReviews);

router.use(authMiddleware);
router.post("/", validate(createReviewSchema), reviewController.createReview);
router.delete("/:id", reviewController.removeReview);

export default router;