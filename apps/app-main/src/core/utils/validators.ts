export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validators = {
  required(value: string, fieldName: string): string | null {
    if (!value || !value.trim()) return `${fieldName} es obligatorio`;
    return null;
  },

  minLength(value: string, min: number, fieldName: string): string | null {
    if (value.length < min) return `${fieldName} debe tener al menos ${min} caracteres`;
    return null;
  },

  maxLength(value: string, max: number, fieldName: string): string | null {
    if (value.length > max) return `${fieldName} no puede superar ${max} caracteres`;
    return null;
  },

  email(value: string): string | null {
    if (!EMAIL_REGEX.test(value)) return 'Ingresá un correo electrónico válido';
    return null;
  },

  passwordStrength(value: string): string | null {
    if (value.length < 8) return 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(value)) return 'Debe incluir al menos una mayúscula';
    if (!/[a-z]/.test(value)) return 'Debe incluir al menos una minúscula';
    if (!/[0-9]/.test(value)) return 'Debe incluir al menos un número';
    return null;
  },

  match(value: string, compareValue: string, fieldName: string): string | null {
    if (value !== compareValue) return `${fieldName} no coinciden`;
    return null;
  },
};

export function validateRegisterForm(data: {
  firstName: string;
  lastName: string;
  email: string;
  mentorName: string;
  password: string;
  confirmPassword: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const firstNameErr =
    validators.required(data.firstName, 'Nombre') ??
    validators.minLength(data.firstName, 2, 'Nombre') ??
    validators.maxLength(data.firstName, 50, 'Nombre');
  if (firstNameErr) errors.firstName = firstNameErr;

  const lastNameErr =
    validators.required(data.lastName, 'Apellido') ??
    validators.minLength(data.lastName, 2, 'Apellido') ??
    validators.maxLength(data.lastName, 50, 'Apellido');
  if (lastNameErr) errors.lastName = lastNameErr;

  const emailErr =
    validators.required(data.email, 'Correo electrónico') ?? validators.email(data.email);
  if (emailErr) errors.email = emailErr;

  const mentorErr =
    validators.required(data.mentorName, 'Nombre del mentoría') ??
    validators.minLength(data.mentorName, 3, 'Nombre del mentoría');
  if (mentorErr) errors.mentorName = mentorErr;

  const passwordErr =
    validators.required(data.password, 'Contraseña') ??
    validators.passwordStrength(data.password);
  if (passwordErr) errors.password = passwordErr;

  const confirmErr =
    validators.required(data.confirmPassword, 'Confirmación') ??
    validators.match(data.confirmPassword, data.password, 'Las contraseñas');
  if (confirmErr) errors.confirmPassword = confirmErr;

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateLoginForm(data: {
  email: string;
  password: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const emailErr =
    validators.required(data.email, 'Correo electrónico') ?? validators.email(data.email);
  if (emailErr) errors.email = emailErr;

  const passwordErr = validators.required(data.password, 'Contraseña');
  if (passwordErr) errors.password = passwordErr;

  return { valid: Object.keys(errors).length === 0, errors };
}
