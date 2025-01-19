import Config from "@config/index";
import { Client } from "@notionhq/client"

export default class NotionClient {
    private static instance: NotionClient;
    private client: Client;
    private config = new Config().getConfig();

    private constructor() {
        this.client = new Client({ auth: this.config.notion.apiKey });
    }

    static getInstance(): NotionClient {
        if (!NotionClient.instance) {
            NotionClient.instance = new NotionClient();
        }
        return NotionClient.instance;
    }

    getClient(): Client {
        return this.client;
    }
}