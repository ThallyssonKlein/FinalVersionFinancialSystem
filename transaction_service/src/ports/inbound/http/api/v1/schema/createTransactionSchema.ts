import joi from "joi"

const transactionSchema = joi.object({
    description: joi.string().required(),
    type: joi.string().valid('PIX', 'TED', 'DOC', 'BOLETO', 'DEPOSITO', 'CREDITO', 'DEBITO').required(),
    value: joi.number().required(),
    date: joi.date().required(),
    user_token: joi.string().required(),
    id: joi.string().optional(),
})

export default joi.object({
    custom_name: joi.string().optional(),
    transactionSchema: joi.array().items(transactionSchema).required()
})