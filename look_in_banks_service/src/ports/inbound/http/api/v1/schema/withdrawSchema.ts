import Joi from "joi"

export default Joi.object({
    pixKey: Joi.string(),
    invoice: Joi.string(),
    currency: Joi.string().valid("BRL", "BTC").required(),
    amount: Joi.number()
})