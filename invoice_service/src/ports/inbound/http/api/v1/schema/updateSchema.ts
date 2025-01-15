import Joi from 'joi'

export default Joi.object({
  username: Joi.string().max(30).optional(),
  email: Joi.string().max(50).optional(),
  xUsername: Joi.string().max(30).optional(),
  instagramUsername: Joi.string().max(30).optional(),
  facebookUsername: Joi.string().max(30).optional(),
  nostrUsername: Joi.string().max(30).optional(),
  telegramUsername: Joi.string().max(30).optional(),
  whatsappUsername: Joi.string().max(30).optional(),
  youtubeUsername: Joi.string().max(30).optional(),
  twitchUsername: Joi.string().max(30).optional()
})
