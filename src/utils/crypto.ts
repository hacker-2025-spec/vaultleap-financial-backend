import crypto from 'node:crypto'
import { promisify } from 'node:util'

type EncryptionResult = {
  encrypted: string
  authTag: Buffer
  secretKey: Buffer
  iv: Buffer
}
const randomBytes = promisify(crypto.randomBytes)
const INIT_VECTOR_SIZE = 12
const SECRET_KEY_SIZE = 32
const ALGORITHM = 'aes-256-gcm'

const getRandomInitVector = () => randomBytes(INIT_VECTOR_SIZE)
const getRandomSecretKey = () => randomBytes(SECRET_KEY_SIZE)

export const encrypt = async (str: string): Promise<EncryptionResult> => {
  const iv = await getRandomInitVector()
  const secretKey = await getRandomSecretKey()
  const cipher = crypto.createCipheriv(ALGORITHM, secretKey, iv)
  const encrypted = cipher.update(str, 'utf8', 'hex') + cipher.final('hex')
  const authTag = cipher.getAuthTag()

  return {
    encrypted,
    authTag,
    secretKey,
    iv,
  }
}

export const decrypt = ({ encrypted, authTag, secretKey, iv }: EncryptionResult): string => {
  const decipher = crypto.createDecipheriv(ALGORITHM, secretKey, iv)
  decipher.setAuthTag(authTag)
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')
}
