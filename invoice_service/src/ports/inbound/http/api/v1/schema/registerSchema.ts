import Joi from 'joi'

export default Joi.object({
  username: Joi.string().max(30).required(),
  password: Joi.string().max(255).required().min(6),
  email: Joi.string().max(50).optional().allow(''),
  x_username: Joi.string().max(30).optional(),
  instagram_username: Joi.string().max(30).optional(),
  facebook_username: Joi.string().max(30).optional(),
  nostr_username: Joi.string().max(30).optional(),
  telegram_username: Joi.string().max(30).optional(),
  whatsapp_username: Joi.string().max(30).optional(),
  youtubeUsername: Joi.string().max(30).optional(),
  twitchUsername: Joi.string().max(30).optional()
})
