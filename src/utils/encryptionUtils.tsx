import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'fallback-key'; // Use .env key or fallback


// Encrypt Function
export const encryptMessage = (message: string): string => {
    return CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
};

// Decrypt Function
export const decryptMessage = (ciphertext: string): string => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};