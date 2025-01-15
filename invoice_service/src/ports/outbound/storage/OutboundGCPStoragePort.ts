import { randomUUID } from 'node:crypto'
import { Storage } from '@google-cloud/storage'
import Loggable from '@shared/Loggable'
import Config from '@config/index'

export default class OutboundGCPStoragePort extends Loggable {
  private readonly storage: Storage
  private config = new Config().getConfig()

  constructor() {
    super('OutboundGCPStoragePort')
    this.storage = new Storage(
      {
        keyFilename: 'storage_creator_key.json',
      }
    )
  }

  async uploadProfilePicture(file: Express.Multer.File, traceId: string): Promise<string> {
    try {
      const fileExtension = file.mimetype.split('/')[1]
      const fileName = `${Date.now()}-${randomUUID()}.${fileExtension}`

      const filePath = `profile_picture/${fileName}`
      const blob = this.storage.bucket(this.config.photosBucketName).file(filePath);

      const stream = blob.createWriteStream({
        public: true,
        resumable: false,
        metadata: {
          contentLength: file.size,
          contentType: file.mimetype
        }
      })

      return new Promise((resolve, reject) => {
        stream.on('finish', async () => {
          resolve(`https://storage.googleapis.com/${this.config.photosBucketName}/${filePath}`)
        })

        stream.on('error', (err) => {
          reject(err)
        })

        stream.end(file.buffer)
      })
    } catch (err) {
      this.error("Error while uploading profile picture.", traceId)
    }
  }

    async deleteProfilePicture(fileName: string, traceId: string): Promise<void> {
      try {
        console.log(fileName)
        const filePath = `profile_picture/${fileName}`
        const file = this.storage.bucket(this.config.photosBucketName).file(filePath);
    
        await file.delete();
        this.log(`File ${filePath} deleted successfully.`, traceId);
      } catch (err) {
        console.log(err)
        this.error("Error while deleting profile picture.", traceId);
      }
  }
}
