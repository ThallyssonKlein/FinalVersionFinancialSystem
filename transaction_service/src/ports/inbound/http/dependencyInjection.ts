import ConfigService from "@domain/config/ConfigService";
import TransactionService from "@domain/transaction/TransactionService";
import OutboundTokenRepositoryPort from "@ports/outbound/database/token/OutboundTokenRepositoryPort";
import OutboundTransactionFromBankRepositoryPort from "@ports/outbound/database/transaction/OutboundTransactionFromBankRepositoryPort";
import OutboundConfigRepositoryPort from "@ports/outbound/mongodb/config/OutboundConfigRepositoryPort";
import OutboundTransactionNotionRepositoryPort from "@ports/outbound/notion/OutboundTransactionNotionRepositoryPort";
import OutboundRulesEngineRepositoryPort from "@ports/outbound/rules_engine/OutboundRulesEngineRepositoryPort";
import InboundConfigAdapter from "adaptes/inbound/InboundConfigAdapter";
import InboundTokenAdapter from "adaptes/inbound/InboundTokenAdapter";
import InboundTransactionAdapter from "adaptes/inbound/InboundTransactionAdapter";
import OutboundConfigAdapter from "adaptes/outbound/OutboundConfigAdapter";
import OutboundCustomNameQueueAdapter from "adaptes/outbound/OutboundCustomNameQueueAdapter";
import OutboundRulesEngineAdapter from "adaptes/outbound/OutboundRulesEngineAdapter";
import OutboundTransactionFromBankAdapter from "adaptes/outbound/OutboundTransactionFromBankAdapter";
import OutboundTransactionNotionAdapter from "adaptes/outbound/OutboundTransactionNotionAdapter";
import Routes from "./api/v1/Routes";
import Database from "@ports/outbound/database/Database";
import MongoDB from "@ports/outbound/mongodb/config/MongoDB";
import NotionClient from "@ports/outbound/notion/NotionClient";
import RulesEngineClient from "@ports/outbound/rules_engine/RulesEngineClient";

export default class dependencyInjection {
    private routes: any;

    constructor(server: any) {
        // outbound
        // port
        // fazer o protected routes
        const dbInstance = Database.getInstance();
        dbInstance.connect();
        const pool = dbInstance.getPool();
        const mongodb = MongoDB.getInstance();
        mongodb.connect();
        const notionClient = NotionClient.getInstance().getClient();
        const rulesEngineAPIClient = RulesEngineClient.getInstance().getClient();
        const outboundConfigRepositoryPort: OutboundConfigRepositoryPort = new OutboundConfigRepositoryPort();
        const outboundTokenRepositoryPort: OutboundTokenRepositoryPort = new OutboundTokenRepositoryPort(pool);
        const outboundTransactionFromBankRepositoryPort: OutboundTransactionFromBankRepositoryPort = new OutboundTransactionFromBankRepositoryPort(pool);
        const outboundRulesEngineRepositoryPort: OutboundRulesEngineRepositoryPort = new OutboundRulesEngineRepositoryPort(rulesEngineAPIClient);
        const outboundTransactionNotionRepositoryPort: OutboundTransactionNotionRepositoryPort = new OutboundTransactionNotionRepositoryPort(notionClient);

        // adapter
        const outboundConfigAdapter = new OutboundConfigAdapter(outboundConfigRepositoryPort);
        const outboundRulesEngineAdapter = new OutboundRulesEngineAdapter(outboundRulesEngineRepositoryPort);
        const outboundCustomNameQueueAdapter: OutboundCustomNameQueueAdapter = new OutboundCustomNameQueueAdapter();
        const outboundTransactionFromBankAdapter: OutboundTransactionFromBankAdapter = new OutboundTransactionFromBankAdapter(outboundTransactionFromBankRepositoryPort);
        const outboundTransactionNotionAdapter: OutboundTransactionNotionAdapter = new OutboundTransactionNotionAdapter(outboundTransactionNotionRepositoryPort);

        // domain
        const configService: ConfigService = new ConfigService(outboundConfigAdapter, outboundRulesEngineAdapter);
        const transactionService: TransactionService = new TransactionService(outboundTransactionNotionAdapter, outboundCustomNameQueueAdapter, outboundTransactionFromBankAdapter);


        // inbound
        // adapter
        const inboundConfigAdapter = new InboundConfigAdapter(outboundConfigRepositoryPort);
        const inboundTokenAdapter = new InboundTokenAdapter(outboundTokenRepositoryPort);
        const inboundTransactionAdapter = new InboundTransactionAdapter(outboundTransactionFromBankRepositoryPort, configService, transactionService);

        // port
        this.routes = new Routes(inboundTransactionAdapter, inboundConfigAdapter, inboundTokenAdapter);
    }

    getRoutes() {
        return this.routes.getRouter();
    }
}