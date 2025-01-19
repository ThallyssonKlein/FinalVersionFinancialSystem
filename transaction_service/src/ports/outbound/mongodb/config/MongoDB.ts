import mongoose from 'mongoose';
import Config from '@config/index';

export default class MongoDB {
    private static instance: MongoDB;

    private constructor() {}

    static getInstance(): MongoDB {
        if (!MongoDB.instance) {
            MongoDB.instance = new MongoDB();
        }
        return MongoDB.instance;
    }

    connect(): void {
        const config = new Config().getConfig();
        mongoose.connect(config.mongodb.uri)
        .then(() => console.log('Conectado ao MongoDB com sucesso!'))
        .catch(err => console.error('Erro ao conectar ao MongoDB:', err));
    }

}