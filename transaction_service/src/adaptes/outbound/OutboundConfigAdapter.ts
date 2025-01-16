import { ConfigBO } from "@domain/config/ConfigBO";
import OutboundConfigRepositoryPort from "@ports/outbound/mongodb/config/OutboundConfigRepositoryPort";
import Loggable from "@shared/Loggable";

export default class OutboundConfigAdapter extends Loggable {
    constructor(
        private outboundConfigRepositoryPort: OutboundConfigRepositoryPort,
    ) {
        super('OutboundConfigAdapter');
    }

    async findAllConfigs(): Promise<ConfigBO[]> {
        this.log.info(`Finding all configs`);
        const result = await this.outboundConfigRepositoryPort.findAllConfigs();
        this.log.info(`Found ${result.length} configs`);
        return result;
    }
}