/**
 * Funciones de validación puras para formularios.
 * Cada función recibe un valor y retorna una clave de error i18n o null si es válido.
 * Los componentes traducen la clave usando useTranslation('auth').
 */

/** Regex estándar para formato de email (RFC 5322 simplificado) */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Solo letras (incluyendo acentos y ñ) y espacios */
const ONLY_LETTERS_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return 'validation.email_required';
  if (!EMAIL_REGEX.test(trimmed)) return 'validation.email_invalid';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'validation.password_required';
  if (password.length < 8) return 'validation.password_min_length';
  return null;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) return 'validation.confirm_password_required';
  if (password !== confirmPassword) return 'validation.confirm_password_mismatch';
  return null;
}

/**
 * Valida un campo de nombre (name o lastname).
 * @param value - Valor del campo
 * @param field - 'name' | 'lastname' para elegir las claves de error correctas
 */
export function validateNameField(value: string, field: 'name' | 'lastname'): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `validation.${field}_required`;
  if (!ONLY_LETTERS_REGEX.test(trimmed)) return `validation.${field}_only_letters`;
  if (trimmed.length < 2) return `validation.${field}_min_length`;
  return null;
}

export function validateCountry(country: string): string | null {
  if (!country) return 'validation.country_required';
  return null;
}

export function validateAddress(address: string): string | null {
  const trimmed = address.trim();
  if (!trimmed) return 'validation.address_required';
  if (trimmed.length < 10) return 'validation.address_min_length';
  return null;
}

/**
 * Valida todos los campos del Step 1 (credenciales).
 * Retorna un objeto con errores por campo. Campos sin error no aparecen.
 */
export function validateStep1(data: {
  email: string;
  password: string;
  confirmPassword: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;
  const confirmError = validateConfirmPassword(data.password, data.confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;
  return errors;
}

/**
 * Valida todos los campos del Step 2 (datos personales).
 * Retorna un objeto con errores por campo.
 */
export function validateStep2(data: {
  name: string;
  lastname: string;
  country: string;
  address: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  const nameError = validateNameField(data.name, 'name');
  if (nameError) errors.name = nameError;
  const lastnameError = validateNameField(data.lastname, 'lastname');
  if (lastnameError) errors.lastname = lastnameError;
  const countryError = validateCountry(data.country);
  if (countryError) errors.country = countryError;
  const addressError = validateAddress(data.address);
  if (addressError) errors.address = addressError;
  return errors;
}

/**
 * Valida credenciales de login.
 * Retorna un objeto con errores por campo.
 */
export function validateLoginForm(data: {
  email: string;
  password: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;
  return errors;
}
