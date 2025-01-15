import Joi from 'joi';

export default Joi.object({
  startDate: Joi.string(),
  endDate: Joi.string()
});