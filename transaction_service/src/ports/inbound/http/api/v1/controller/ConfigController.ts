import { NextFunction, Response } from "express";
import Loggable from "../../../../../../shared/Loggable";
import CustomRequest from "../middleware/CustomRequest";
import InboundConfigAdapter from "adaptes/inbound/InboundConfigAdapter";
import { ConfigBO } from "@domain/config/ConfigBO";

export default class ConfigController extends Loggable {

    constructor(
        private inboundConfigAdapter: InboundConfigAdapter
    ) {
        super("ConfigController")
    }

    async saveConfig(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const body = req.body as ConfigBO;

            res.status(200).json(
                await this.inboundConfigAdapter.saveConfig(body)
            )
        } catch (err) {
            next(err);
        }
    }
}