import { Schema, model } from 'mongoose';
import { ConfigBO, Unity } from '../../../../domain/config/ConfigBO';

const ConfigSchema = new Schema({
  time: {
    value: { type: Number },
    unity: { type: String, enum: Object.values(Unity) }
  },
  useInCalculation: {
    reimbursement: { type: Number },
    values_average: { type: Number },
    time: {
      value: { type: Number },
      unity: { type: String, enum: Object.values(Unity) }
    }
  },
  display: {
    monthly_total: { type: Number },
    next_buy_date: { type: Date },
    source: { type: String },
    amount: { type: Number }
  },
  findPair: {
    pair_name: { type: String }
  },
  between: {
    value1: { type: Schema.Types.Mixed },
    value2: { type: Schema.Types.Mixed }
  },
  frequency: {
    value: { type: Number },
    targetNumber: { type: Number },
    unity: { type: String, enum: Object.values(Unity) }
  },
  rule: {
    used_in_calculation: { type: String }
  }
}, {
  timestamps: true
});

const ConfigModel = model<ConfigBO>('Config', ConfigSchema);

export default class OutbouncConfigRepositoryPort {
    getModel() {
        return ConfigModel;
    }

    async findAllConfigs(): Promise<ConfigBO[]> {
        return ConfigModel.find();
    }
}