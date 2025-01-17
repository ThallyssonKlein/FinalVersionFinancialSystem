import Joi from "joi";

export default Joi.object({
    value: Joi.number().required(),
    unity: Joi.string().valid('DAY', 'WEEK', 'MONTH', 'YEAR').required(),
});