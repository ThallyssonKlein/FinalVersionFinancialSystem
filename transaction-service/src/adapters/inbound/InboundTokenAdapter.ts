import IToken from "@ports/outbound/database/token/IToken";
import OutboundTokenRepositoryPort from "@ports/outbound/database/token/OutboundTokenRepositoryPort";
import Loggable from "@shared/Loggable";

export default class InboundTokenAdapter extends Loggable {
    constructor(private outboundTokenRepositoryPort: OutboundTokenRepositoryPort) {
        super('InboundTokenAdapter');
    }

    async findToken(token: string): Promise<IToken> {
        this.log.info('Finding token', token);
        return this.outboundTokenRepositoryPort.findToken(token);
    }

}