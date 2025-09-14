import { randomBytes, createHash } from 'crypto';

const createRawToken = () => {
    return randomBytes(32).toString('hex')
}

const createSha =  (token: string) => {
    return createHash('sha256').update(token, 'utf8').digest('hex')
}




export default { createSha,createRawToken }