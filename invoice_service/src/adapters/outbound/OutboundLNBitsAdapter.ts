import OutboundLNBitsApiPort from "@ports/outbound/http/OutboundLNBitsAPIPort";
import Loggable from "@shared/Loggable";

export default class OutboundLNBitsAdapter extends Loggable {
    constructor(
        private outboundLNBitsApiPort: OutboundLNBitsApiPort
    ) {
        super("OutboundLNBitsAdapter");
    }

    async doBtcWithdraw(invoice: string, traceId: string): Promise<void> {
        await this.outboundLNBitsApiPort.doBtcWithdraw(invoice, traceId);
        this.log.info("BTC withdraw done", traceId);
    }

    async getInvoiceAmount(invoice: string, traceId: string): Promise<number> {
        return this.outboundLNBitsApiPort.getInvoiceAmount(invoice, traceId);
    }
}