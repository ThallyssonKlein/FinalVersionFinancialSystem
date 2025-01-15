import OutboundEfiBankApiPort from "@ports/outbound/http/OutboundEfiBankApiPort";
import Loggable from "@shared/Loggable";

export default class OutboundEfiBankAPIAdapter extends Loggable {
    constructor(
        private outboundEfiBankApiPort: OutboundEfiBankApiPort
    ) {
        super("OutboundEfiBankAPIAdapter");
    }

    async doPixWithdraw(amount: string, pixKey: string, withdrawId: number, traceId: string): Promise<void> {
        await this.outboundEfiBankApiPort.doPixWithdraw(amount, pixKey, withdrawId, traceId);
    }
}