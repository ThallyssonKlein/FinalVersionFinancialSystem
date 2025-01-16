import IConfigDAO from "@domain/config/ConfigBO";
import OutboundConfigRepositoryPort from "@ports/outbound/mongodb/config/OutboundConfigRepositoryPort";
import Loggable from "@shared/Loggable";

export default class InboundConfigAdapter extends Loggable {
    constructor(
        private outboundConfigRepositoryPort: OutboundConfigRepositoryPort
    ) {
        super('InboundConfigAdapter');
    }

    async saveConfig(config: IConfigDAO) {
        this.log.info(`Saving config ${config.name}`);
        const result = await this.outboundConfigRepositoryPort.getModel().create(config);
        this.log.info(`Config saved with id ${result.id}`);
        return result;
    }
}