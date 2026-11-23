import fs from 'fs'
import path from 'path'

export interface StorageProvider {
  upload(file: Buffer, filename: string, directory: string): Promise<string>
  delete(filepath: string): Promise<void>
  getUrl(filepath: string): string
  exists(filepath: string): Promise<boolean>
}

class LocalStorage implements StorageProvider {
  private baseDir: string

  constructor() {
    this.baseDir = process.env.UPLOAD_DIR || './uploads'
  }

  async upload(file: Buffer, filename: string, directory: string): Promise<string> {
    const dirPath = path.join(this.baseDir, directory)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }

    const ext = path.extname(filename)
    const name = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`
    const filepath = path.join(directory, name)
    const fullPath = path.join(this.baseDir, filepath)

    fs.writeFileSync(fullPath, file)
    return filepath
  }

  async delete(filepath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filepath)
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
    }
  }

  getUrl(filepath: string): string {
    if (filepath.startsWith('http')) return filepath
    return `/uploads/${filepath}`
  }

  async exists(filepath: string): Promise<boolean> {
    const fullPath = path.join(this.baseDir, filepath)
    return fs.existsSync(fullPath)
  }
}

class S3Storage implements StorageProvider {
  private bucket: string
  private endpoint: string
  private region: string

  constructor() {
    this.bucket = process.env.S3_BUCKET || ''
    this.endpoint = process.env.S3_ENDPOINT || ''
    this.region = process.env.S3_REGION || 'us-east-1'
  }

  async upload(file: Buffer, filename: string, directory: string): Promise<string> {
    // S3 upload implementation
    // This would use @aws-sdk/client-s3 in production
    const ext = filename.substring(filename.lastIndexOf('.'))
    const key = `${directory}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`

    // Placeholder for S3 upload - install @aws-sdk/client-s3 for production
    console.log(`S3 upload: ${key} to ${this.bucket}`)

    // For now, fall back to local storage
    const local = new LocalStorage()
    return local.upload(file, filename, directory)
  }

  async delete(filepath: string): Promise<void> {
    console.log(`S3 delete: ${filepath} from ${this.bucket}`)
  }

  getUrl(filepath: string): string {
    if (filepath.startsWith('http')) return filepath
    if (this.endpoint) {
      return `${this.endpoint}/${this.bucket}/${filepath}`
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${filepath}`
  }

  async exists(filepath: string): Promise<boolean> {
    console.log(`S3 exists check: ${filepath}`)
    return false
  }
}

let storageInstance: StorageProvider | null = null

export function getStorage(): StorageProvider {
  if (storageInstance) return storageInstance

  if (process.env.S3_BUCKET && process.env.S3_ACCESS_KEY) {
    storageInstance = new S3Storage()
  } else {
    storageInstance = new LocalStorage()
  }

  return storageInstance
}

export function validateFileType(mimeType: string, allowedTypes: readonly string[]): boolean {
  return allowedTypes.includes(mimeType)
}

export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize
}
