import { create } from 'apisauce';

import Config from '@config/index';
import { InternalError } from '@ports/inbound/http/api/v1/error';
import Loggable from '@shared/Loggable';
import OutboundChargeDTO from './dto/OutboundChargeDTO';

export default class OutboundLNBitsApiPort extends Loggable {
    private static instance: OutboundLNBitsApiPort;
    private api: any;
    private config = new Config().getConfig();

    private constructor() {
        super('OutboundLNBitsApiPort');

        this.api = create({
            baseURL: this.config.lnbitsBaseURL,
            headers: { Accept: 'application/json' },
        }); 
    }

    static getInstance(): OutboundLNBitsApiPort {
        if (!OutboundLNBitsApiPort.instance) {
            OutboundLNBitsApiPort.instance = new OutboundLNBitsApiPort();
        }
        return OutboundLNBitsApiPort.instance;
    }

    async createCharge(amount: number, traceId: string): Promise<OutboundChargeDTO>{
        const response = await this.api.post('/payments', {
            out: false,
            unit: 'sat',
            amount: amount,
            webhook: this.config.lnbitsWebhookPath,
            memo: "LiveTip",
        }, {
            headers: {
                'X-API-KEY': this.config.lnbitsApiKey
            }
        });

        if (!response.ok || !response.data || !response.data.payment_request || !response.data.payment_hash) {
            this.log.error('Error creating lnbits charge: ' + response.problem, traceId);
            throw new InternalError();
        }

        return new OutboundChargeDTO(
            response.data.payment_request,
            response.data.payment_hash,
        )
    }

    async getInvoiceAmount(invoice: string, traceId: string): Promise<number> {
        const response = await this.api.post('/payments/decode', {
            data: invoice
        }, {
            headers: {
                'X-API-KEY': this.config.lnbitsApiKey
            }
        });

        if (!response.ok || !response.data || !response.data.amount_msat) {
            this.log.error('Error getting invoice amount: ' + response, traceId);
            throw new InternalError();
        }

        return response.data.amount_msat
    }


    async doBtcWithdraw(invoice: string, traceId: string): Promise<void> {
        const response = await this.api.post('/payments', {
            bolt11: invoice,
            out: true
        }, {
            headers: {
                'X-API-KEY': this.config.lnbitsApiKey
            }
        });

        if (!response.ok) {
            this.log.error('Error doing btc withdraw: ' + response.problem, traceId);
            throw new InternalError();
        }
    }
}