import validator from 'validator';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates email address format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  
  const trimmedEmail = email.trim();
  
  if (!validator.isEmail(trimmedEmail)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true };
};

/**
 * Validates phone number format
 * Expected format: +[country-code][digits] (e.g., +911234567890)
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }
  
  const trimmedPhone = phone.trim();
  const phoneRegex = /^\+\d{10,15}$/;
  
  if (!phoneRegex.test(trimmedPhone)) {
    return { 
      valid: false, 
      error: 'Phone must be in format +[country][number] (e.g., +911234567890)' 
    };
  }
  
  return { valid: true };
};

/**
 * Validates password strength
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { 
      valid: false, 
      error: 'Password must be at least 8 characters' 
    };
  }
  
  return { valid: true };
};

/**
 * Validates username (if provided)
 */
export const validateUsername = (username: string): ValidationResult => {
  if (!username) {
    return { valid: true }; // Username is optional
  }
  
  if (username.length < 3) {
    return { 
      valid: false, 
      error: 'Username must be at least 3 characters' 
    };
  }
  
  return { valid: true };
};

/**
 * Masks email address for display
 * Example: user@example.com -> us**@example.com
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return email;
  
  const [local, domain] = email.split('@');
  const visibleChars = Math.min(2, local.length);
  const maskedLocal = local.slice(0, visibleChars) + '*'.repeat(Math.max(0, local.length - visibleChars));
  
  return `${maskedLocal}@${domain}`;
};

/**
 * Masks phone number for display
 * Example: +911234567890 -> +91*******890
 */
export const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 6) return phone;
  
  const visibleStart = 3;
  const visibleEnd = 3;
  const maskedLength = phone.length - visibleStart - visibleEnd;
  
  return phone.slice(0, visibleStart) + '*'.repeat(maskedLength) + phone.slice(-visibleEnd);
};

/**
 * Validates OTP format
 */
export const validateOTP = (otp: string): ValidationResult => {
  if (!otp) {
    return { valid: false, error: 'OTP is required' };
  }
  
  if (otp.length !== 6) {
    return { valid: false, error: 'OTP must be 6 digits' };
  }
  
  if (!/^\d+$/.test(otp)) {
    return { valid: false, error: 'OTP must contain only numbers' };
  }
  
  return { valid: true };
};
