import OutboundUserRepositoryPort from "@ports/outbound/postgresql/user/OutboundUserRepositoryPort";
import Loggable from "@shared/Loggable";

export default class InboundUserJobAdapter extends Loggable {
    constructor(private outboundUserRepositoryPort: OutboundUserRepositoryPort) {
        super("InboundUserJobAdapter");
    }

    async deletePhysicallyAllLogicallyDeletedUsers(traceId: string): Promise<void> {
        const logicallyDeletedUsers = await this.outboundUserRepositoryPort.findAllLogicallyDeletedUsersMoreThan1MonthAgo();
        this.log.info(`Found ${logicallyDeletedUsers.length} logically deleted users to be physically deleted`, traceId);

        for (const user of logicallyDeletedUsers) {
            await this.outboundUserRepositoryPort.physicalDelete(user.id);
        }
        this.log.info("All logically deleted users physically deleted", traceId);
    }
}