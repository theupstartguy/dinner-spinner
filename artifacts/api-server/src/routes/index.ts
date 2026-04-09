import { Router, type IRouter } from "express";
import healthRouter from "./health";
import fridgeRouter from "./fridge";
import stripeRouter from "./stripe";

const router: IRouter = Router();

router.use(healthRouter);
router.use(fridgeRouter);
router.use(stripeRouter);

export default router;
