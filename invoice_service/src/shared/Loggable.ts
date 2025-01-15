export default class Loggable {
    protected log;

    constructor(private prefix: string) {
        this.log = this;
    }

    // Função para formatar a mensagem de log
    private formatMessage(level: string, message: string, traceId?: string): string {
        const timestamp = new Date().toISOString();
        return `${timestamp} ${this.prefix} ${level}: [${traceId}] ${message}`;
    }

    info(message: string, traceId?: string) {
        console.log(this.formatMessage('info', message, traceId));
    }

    error(message: string, traceId?: string) {
        console.error(this.formatMessage('error', message, traceId));
    }
}

// import winston from 'winston';
// import { LoggingWinston } from '@google-cloud/logging-winston';

// export default class Loggable {
//     protected logger: winston.Logger;
//     protected log;

//     constructor(prefix: string) {
//         this.log = this;
//         const customFormat = winston.format.printf(({ level, message, timestamp }) => {
//             return `${timestamp} ${prefix} ${level}: ${message}`;
//         });

//         this.logger = winston.createLogger({
//             level: 'info',
//             format: winston.format.combine(
//                 winston.format.timestamp(),
//                 customFormat
//             ),
//             transports: [
//                 new winston.transports.Console(),
//                 new LoggingWinston()
//             ]
//         });
//     }

//     info(message, traceId?: string) {
//       this.logger.info("[" + traceId + "] " + message);
//     }

//     error(message, traceId?: string) { 
//       this.logger.error("[" + traceId + "] " + message);
//     }
// }