import Config from '@config/index';
import { create } from 'apisauce';

export default class RulesEngineClient {
    private static instance: RulesEngineClient;
    private client: any;
    private config = new Config().getConfig();

    private constructor() {
        this.client = create({
            baseURL: process.env.RULES_ENGINE_URL,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RULES_ENGINE_API_KEY}`
            }
        });
    }

    static getInstance(): RulesEngineClient {
        if (!RulesEngineClient.instance) {
            RulesEngineClient.instance = new RulesEngineClient();
        }
        return RulesEngineClient.instance;
    }

    getClient(): any {
        return this.client;
    }
}