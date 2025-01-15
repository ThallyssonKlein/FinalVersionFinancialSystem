import Loggable from '@shared/Loggable'
import CustomRequest from './CustomRequest'
import { Response, NextFunction } from 'express'
import multer from 'multer'

export default class FileUploadMiddleware extends Loggable {
  constructor() {
    super('FileUploadMiddleware')
    this.handle = this.handle.bind(this)
  }

  handle(req: CustomRequest, res: Response, next: NextFunction) {
    const multerMiddleware = multer({
      storage: multer.memoryStorage(),
      fileFilter(_, file, callback) {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
          callback(null, true)
        } else {
          callback(new Error('Only PNG and JPEG files are allowed'))
        }
      },
    }).single('profile_picture')

    multerMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        this.log.error('MulterError: ' + err.message, req.traceId)
        return res.status(500).send({
          message: "Internal Server Error",
          name: "Error",
          status: 500,
        });
      } else if (err) {
        this.log.error('MulterError: ' + err.message, req.traceId)
        return res.status(500).send({
          message: "Internal Server Error",
          name: "Error",
          status: 500,
        });
      }

      next()
    })
  }
}
