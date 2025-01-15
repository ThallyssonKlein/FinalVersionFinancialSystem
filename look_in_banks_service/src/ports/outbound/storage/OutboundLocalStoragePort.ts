import { randomUUID } from 'node:crypto';
import { promises as fs } from 'fs';
import path from 'path';
import Loggable from '@shared/Loggable';
import Config from '@config/index';

export default class OutboundLocalStoragePort extends Loggable {
  private config = new Config().getConfig();

  constructor() {
    super('OutboundLocalStoragePort');
  }

  async uploadProfilePicture(file: Express.Multer.File, traceId: string): Promise<string> {
    try {
      const fileExtension = file.mimetype.split('/')[1];
      const fileName = `${Date.now()}-${randomUUID()}.${fileExtension}`;
      const uploadsDir = path.resolve('/app/uploads/profile_pictures'); // Use absolute path

      await fs.mkdir(uploadsDir, { recursive: true });

      const filePath = path.join(uploadsDir, fileName);

      await fs.writeFile(filePath, file.buffer);

      let urlPrefix;

      if (this.config.env === 'development') {
        urlPrefix = `http://localhost:${this.config.port}`;
      } else {
        urlPrefix = `${this.config.host}`;
      }
      const publicUrl = `${urlPrefix}/uploads/profile_pictures/${fileName}`;
      this.info(`File uploaded successfully: ${fileName}`, traceId);
      return publicUrl;
    } catch (err) {
      this.error("Error while uploading profile picture.", traceId);
      throw err;
    }
  }

  async deleteProfilePicture(fileName: string, traceId: string): Promise<void> {
    try {
      const uploadsDir = path.resolve('/app/uploads/profile_pictures');
      const filePath = path.join(uploadsDir, fileName);

      await fs.unlink(filePath);

      this.info(`File ${fileName} deleted successfully from ${filePath}.`, traceId);
    } catch (err) {
      if (err.code === 'ENOENT') {
        this.error(`File ${fileName} not found, skipping deletion.`, traceId);
      } else {
        this.error("Error while deleting profile picture.", traceId);
        throw err;
      }
    }
  }
}
