import { Schema, model } from 'mongoose';
import { ConfigBO, Unity } from '../../../../domain/config/ConfigBO';
import IToken from '@ports/outbound/database/token/IToken';

const configSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  user_token: { type: String, required: true },
  use_calculated: {
    // Ajuste o tipo conforme 'UseCalculated'
    type: Object,
    required: true
  },
  display: {
    // Ajuste o tipo conforme 'Display'
    type: Object,
    required: true
  },
  rules: {
    // Ajuste o tipo conforme 'Rule[]'
    type: Array,
    required: true
  },
  use: {
    // Ajuste o tipo conforme 'Use'
    type: Object,
    required: true
  },
  custom_name: { type: Boolean, required: true },
  find_pair: {
    // Ajuste o tipo conforme 'FindPair'
    type: Object
  }
});

const ConfigModel = model('Config', configSchema);

export default class OutbouncConfigRepositoryPort {
    getModel() {
        return ConfigModel;
    }

    async findAllConfigs(userToken: IToken): Promise<ConfigBO[]> {
        return ConfigModel.find({
          user_token: userToken.value
        });
    }
}