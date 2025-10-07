
import { createCipheriv, randomBytes, scrypt, createDecipheriv } from 'crypto';
import { promisify } from 'util';

export const encryptData = async (textToEncrypt: string, encryptionPassword: string) => {
    const iv = randomBytes(16);
    const key = (await promisify(scrypt)(encryptionPassword, 'salt', 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, iv);

    const encryptedText = Buffer.concat([
        cipher.update(textToEncrypt),
        cipher.final(),
    ]);
    return {
        encryptedText,
        key,
        iv
    }
}

export const decryptData = async (encryptedText: NodeJS.ArrayBufferView<ArrayBufferLike>, key: string, iv: string) => {
    const decipher = createDecipheriv('aes-256-ctr', key, iv);
    const decryptedText = Buffer.concat([
        decipher.update(encryptedText),
        decipher.final(),
    ]);
    return decryptedText
}