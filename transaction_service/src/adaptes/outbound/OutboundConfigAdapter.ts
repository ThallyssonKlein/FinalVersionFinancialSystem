import { ConfigBO } from "@domain/config/ConfigBO";
import IToken from "@ports/outbound/database/token/IToken";
import OutboundConfigRepositoryPort from "@ports/outbound/mongodb/config/OutboundConfigRepositoryPort";
import Loggable from "@shared/Loggable";

export default class OutboundConfigAdapter extends Loggable {
    constructor(
        private outboundConfigRepositoryPort: OutboundConfigRepositoryPort,
    ) {
        super('OutboundConfigAdapter');
    }

    async findAllConfigs(userToken: IToken, traceId: string): Promise<ConfigBO[]> {
        this.log.info(`Finding all configs`, traceId);
        const result = await this.outboundConfigRepositoryPort.findAllConfigs(userToken);
        this.log.info(`Found ${result.length} configs`, traceId);
        return result;
    }
}