export default class OutboundChargeDTO {
    qrCode: string;
    paymentId: string;

    constructor(qrCode: string, paymentId: string) {
        this.qrCode = qrCode;
        this.paymentId = paymentId;
    }
}