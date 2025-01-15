import Joi from "joi"

export default Joi.object({
    page: Joi.number().optional(),
    limit: Joi.number().max(100).optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional()
})