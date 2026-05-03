import type { FormFields, FormErrors } from '@/types/login'

export function validateEmail(value: string): string {
  if (!value.trim()) return 'Email is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return 'Enter a valid email address.'
  }
  return ''
}

export function validatePassword(value: string): string {
  if (!value) return 'Password is required.'
  const rules = [
    { test: /.{8,}/, message: 'At least 8 characters.' },
    { test: /[A-Z]/, message: 'At least 1 uppercase letter.' },
    { test: /[a-z]/, message: 'At least 1 lowercase letter.' },
    { test: /[0-9]/, message: 'At least 1 digit.' },
    { test: /[^A-Za-z0-9]/, message: 'At least 1 special character.' },
  ]
  for (const rule of rules) {
    if (!rule.test.test(value)) return rule.message
  }
  return ''
}

export function validateAll(fields: FormFields): FormErrors {
  return {
    email: validateEmail(fields.email),
    password: validatePassword(fields.password),
  }
}
