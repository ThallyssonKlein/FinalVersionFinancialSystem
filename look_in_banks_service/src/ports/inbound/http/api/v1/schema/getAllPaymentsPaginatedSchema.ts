import Joi from "joi"

export default Joi.object({
  page: Joi.number(),
  limit: Joi.number().max(100)
})