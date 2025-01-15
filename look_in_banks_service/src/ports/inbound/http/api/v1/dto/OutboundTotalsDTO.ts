export default class OutboundTotalsDTO {
    brlTotal: number;
    btcTotal: number;
    count: number;

    constructor(brlTotal: number, btcTotal: number, count: number) {
        this.brlTotal = brlTotal;
        this.btcTotal = btcTotal;
        this.count = count;
    }
}