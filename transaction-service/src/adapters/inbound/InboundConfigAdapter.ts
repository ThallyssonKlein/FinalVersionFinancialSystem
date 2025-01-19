import { ConfigBO } from "@domain/config/ConfigBO";
import OutboundConfigRepositoryPort from "@ports/outbound/mongodb/config/OutboundConfigRepositoryPort";
import Loggable from "@shared/Loggable";

export default class InboundConfigAdapter extends Loggable {
    constructor(
        private outboundConfigRepositoryPort: OutboundConfigRepositoryPort
    ) {
        super('InboundConfigAdapter');
    }

    async saveConfig(config: ConfigBO): Promise<ConfigBO> {
        this.log.info(`Saving config ${config.getName()}`);
        const result = await this.outboundConfigRepositoryPort.createAndReturnConfig(config);
        this.log.info(`Config saved with id ${result.getId()}`);
        return result;
    }
}