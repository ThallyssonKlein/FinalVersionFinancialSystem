// dependencyInjection.ts

// outbound
// port
import OutboundUserRepositoryPort from "@ports/outbound/postgresql/user/OutboundUserRepositoryPort";
import Database from "@ports/outbound/postgresql/Database";

import MongoDB from "@ports/outbound/mongodb/Mongodb";
import OutboundMessageRepositoryPort from "@ports/outbound/mongodb/message/OutboundMessageRepositoryPort";

import SocketIO from "@ports/outbound/socketio/SocketIO";
// adapter

// domain

// inbound
// adapter
import InboundUserAdapter from "@adapters/inbound/http/api/v1/InboundUserAdapter";

import InboundUserJobAdapter from "@adapters/inbound/http/job/InboundUserJobAdapter";

import InboundMessageAdapter from "@adapters/inbound/http/api/v1/message/InboundMessageAdapter";

import InboundTransactionAdapter from "@adapters/inbound/http/api/v1/InboundPaymentAdapter";

// port
import Routes from "@ports/inbound/http/Routes";
import OutboundEfiBankApiPort from "@ports/outbound/http/OutboundEfiBankApiPort";
import OutboundLNBitsApiPort from "@ports/outbound/http/OutboundLNBitsAPIPort";
import OutboundPaymentAndUserRepositoryPort from "@ports/outbound/OutboundTransactionalPaymentConfirmationRepository";
import WithdrawService from "@domain/user/service/WithdrawService";
import OutboundUserAdapter from "@adapters/outbound/OutboundUserAdapter";
import OutboundTransactionAdapter from "@adapters/outbound/OutboundTransactionAdapter";
import OutboundEfiBankAPIAdapter from "@adapters/outbound/OutboundEfiBankAPIAdapter";
import OutboundLNBitsAdapter from "@adapters/outbound/OutboundLNBitsAdapter";
import OutboundTransactionRepositoryPort from "@ports/outbound/postgresql/transaction/OutboundTransactionRepositoryPort";
import OutboundLocalStoragePort from "@ports/outbound/storage/OutboundLocalStoragePort";

export default class dependencyInjection {
    private routes: any;

    constructor(server: any) {
        // outbound
        // port
        const dbInstance = Database.getInstance();
        dbInstance.connect();
        const pool = dbInstance.getPool();
        const outboundUserRepositoryPort = new OutboundUserRepositoryPort(pool);
        const outboundLocalStoragePort = new OutboundLocalStoragePort();

        const mongodb = MongoDB.getInstance();
        mongodb.connect();
        const outboundMessageRepositoryPort = new OutboundMessageRepositoryPort();

        const outboundPaymentAndUserRepositoryPort = new OutboundPaymentAndUserRepositoryPort(pool, outboundMessageRepositoryPort);

        const outboundEfiBankApiPort = OutboundEfiBankApiPort.getInstance();
        const outbundLNBitsApiPort = OutboundLNBitsApiPort.getInstance();

        const wss = SocketIO.getInstance(server);

        const outboundTransactionRepositoryPort = new OutboundTransactionRepositoryPort(pool);
        // adapter
        const outboundUserAdapter = new OutboundUserAdapter(outboundUserRepositoryPort);
        const outboundWithdrawAdapter = new OutboundTransactionAdapter(outboundTransactionRepositoryPort);
        const outboundEfiBankAPIAdapter = new OutboundEfiBankAPIAdapter(outboundEfiBankApiPort);
        const outboundLNBitsAdapter = new OutboundLNBitsAdapter(outbundLNBitsApiPort);

        // domain
        const withDrawService = new WithdrawService(outboundUserAdapter, outboundWithdrawAdapter, outboundEfiBankAPIAdapter, outboundLNBitsAdapter)

        // inbound
        // adapter
        const inboundUserAdapter = new InboundUserAdapter(outboundUserRepositoryPort, withDrawService, outboundLocalStoragePort);

        const inboundUserJobAdapter = new InboundUserJobAdapter(outboundUserRepositoryPort);

        const inboundMessageAdapter = new InboundMessageAdapter(outboundMessageRepositoryPort,
                                                                outboundEfiBankApiPort,
                                                                outbundLNBitsApiPort,
                                                                outboundUserRepositoryPort);

        const inboundPaymentAdapter = new InboundTransactionAdapter(wss,
                                                                outboundMessageRepositoryPort,
                                                                outboundTransactionRepositoryPort,
                                                                outboundPaymentAndUserRepositoryPort,
                                                                outboundUserAdapter);

        // port
        this.routes = new Routes(inboundUserAdapter, inboundUserJobAdapter, inboundMessageAdapter, inboundPaymentAdapter);
    }

    getRoutes() {
        return this.routes.getRouter();
    }
}