import { create } from 'apisauce';
import https from 'https';
import fs from 'fs';

import Config from '@config/index';
import { InternalError } from '@ports/inbound/http/api/v1/error';
import Loggable from '@shared/Loggable';
import OutboundChargeDTO from './dto/OutboundChargeDTO';

export default class OutboundEfiBankApiPort extends Loggable {
    private static instance: OutboundEfiBankApiPort;
    private api: any;
    private config = new Config().getConfig();
    private token: string;
    private refreshTokenTimeout: NodeJS.Timeout | null = null;

    private constructor() {
        super('OutboundEfiBankApiPort');
        const p12Buffer = fs.readFileSync(this.config.efiBankCertPath);
    
        let httpsAgent = undefined;
        httpsAgent = new https.Agent({
            pfx: p12Buffer
        });
    
        this.api = create({
            baseURL: this.config.efiBankBaseURL,
            headers: { Accept: 'application/json' },
            httpsAgent
        }); 
        this.getToken();
    }

    public static resetInstance(): void {
        OutboundEfiBankApiPort.instance = null;
    }
    
    static getInstance(): OutboundEfiBankApiPort {
        if (!OutboundEfiBankApiPort.instance) {
            OutboundEfiBankApiPort.instance = new OutboundEfiBankApiPort();
        }
        return OutboundEfiBankApiPort.instance;
    }
    
    private removeCircularReferences(obj: any) {
        const seen = new WeakSet();
        return JSON.parse(JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return;
                }
                seen.add(value);
            }
            return value;
        }));
    }
    
    private async getToken() {
        const config = new Config().getConfig();
        const clientId = config.efiBankClientId;
        const clientSecret = config.efiBankClientSecret;
        var data = JSON.stringify({ grant_type: "client_credentials" });
        var data_credentials = clientId + ":" + clientSecret;
        var auth = Buffer.from(data_credentials).toString("base64");

        const response = await this.api.post('/oauth/token', data, {
            headers: {
                Authorization: "Basic " + auth,
            }
        });

        if (!response.ok || !response.data || !response.data.access_token || !response.data.expires_in) {
            this.log.error('Error authentication with the EFI API' + response.status);
            this.log.error(JSON.stringify(this.removeCircularReferences(response.data)));
            throw new InternalError();
        }

        this.token = response.data.access_token;
        this.log.info('Efi token updated:' + this.token);
        const refreshTime = response.data.expires_in;

        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
        }

        this.refreshTokenTimeout = setTimeout(() => this.getToken(), refreshTime * 1000);
    }

    async createCharge(amount: string, traceId: string): Promise<OutboundChargeDTO>{
        const pixData = {
            calendario: {
              expiracao: 3600, // 1 hour
            },
            valor: {
              original: amount,
            },
            chave: this.config.efiBankPixKey,
        };
      
        const response = await this.api.post('/v2/cob', pixData, {
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
        });

        if (!response.ok || !response.data || !response.data.pixCopiaECola) {
            this.log.error('Error creating charge: ' + response.status, traceId);
            this.log.error(JSON.stringify(this.removeCircularReferences(response.data)), traceId);
            throw new InternalError();
        }
    
        return new OutboundChargeDTO(
            response.data.pixCopiaECola,
            response.data.txid
        );
    }

    async doPixWithdraw(amount: string, key: string, transactionId: number, traceId: string): Promise<void> {
        const pixData = {
            valor: amount,
            pagador: {
                chave: this.config.efiBankPixKey
            },
            favorecido: {
                chave: key,
            }
        };
      
        const response = await this.api.put('/v2/gn/pix/' + transactionId, pixData, {
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
        });

        if (!response.ok || !response.data || !response.data.status) {
            this.log.error('Error creating charge: ' + response.status, traceId);
            this.log.error(JSON.stringify(this.removeCircularReferences(response.data)), traceId);
            throw new InternalError();
        }
    }
}