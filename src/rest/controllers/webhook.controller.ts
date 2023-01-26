import response from "../../utils/rest/response";
import WebhookService from "../../services/webhook.service";

import type { Request, Response } from "express";

class WebhookController {
    async demo(req: Request, res: Response) {
        const result = await WebhookService.demo(req.body);
        res.status(200).send(response("Demo Webhook fulfilled", result));
    }
}

export default new WebhookController();
