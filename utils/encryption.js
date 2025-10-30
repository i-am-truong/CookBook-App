import CryptoJS from 'crypto-js';

// Secret key for encryption - in production, this should be from .env
const SECRET_KEY = 'cookbook-app-secret-key-2024';

/**
 * Hash a password using SHA256
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
export const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

/**
 * Verify if a plain password matches a hashed password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password to compare
 * @returns {boolean} True if passwords match
 */
export const verifyPassword = (plainPassword, hashedPassword) => {
  const hashedInput = hashPassword(plainPassword);
  return hashedInput === hashedPassword;
};

/**
 * Encrypt data using AES
 * @param {string} data - Data to encrypt
 * @returns {string} Encrypted data
 */
export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

/**
 * Decrypt data using AES
 * @param {string} encryptedData - Encrypted data
 * @returns {string} Decrypted data
 */
export const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Generate a random token for email verification or password reset
 * @returns {string} Random token
 */
export const generateToken = () => {
  // Generate token using Math.random and timestamp (React Native compatible)
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}-${randomPart2}`;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long',
    };
  }
  
  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      message: 'Password must contain both letters and numbers',
    };
  }
  
  return {
    isValid: true,
    message: 'Password is strong',
  };
};

export default {
  hashPassword,
  verifyPassword,
  encryptData,
  decryptData,
  generateToken,
  validateEmail,
  validatePassword,
};
