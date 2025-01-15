import Joi from "joi";

const currencies = ["BTC", "BRL"];

export default Joi.object({
    sender: Joi.string().required(),
    content: Joi.string().required(),
    amount: Joi.string().required(),
    currency: Joi.string().valid(...currencies).required()
});