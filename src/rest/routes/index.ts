import { Router } from "express";
import WebhookRoute from "./webhook.route";

const router = Router();

router.use("/webhooks", WebhookRoute);

export default router;
