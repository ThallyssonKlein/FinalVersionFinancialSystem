import Joi from "joi"

export default Joi.object({
    currency: Joi.string().valid("BRL", "BTC").required(),
    amount: Joi.number().required()
})