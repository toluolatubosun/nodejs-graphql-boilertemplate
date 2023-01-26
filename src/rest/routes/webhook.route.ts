import { Router } from "express";
import WebhookCtrl from "../controllers/webhook.controller";

const router = Router();

router.post("/demo", WebhookCtrl.demo);

export default router;
