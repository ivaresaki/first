import { describe, it, expect } from 'vitest'
import { validateEmail, validatePassword, validateAll } from '@/lib/validation'

describe('validateEmail', () => {
  it('returns error when empty', () => {
    expect(validateEmail('')).toBe('Email is required.')
  })

  it('returns error when only whitespace', () => {
    expect(validateEmail('   ')).toBe('Email is required.')
  })

  it('returns error for missing @', () => {
    expect(validateEmail('notanemail')).toBe('Enter a valid email address.')
  })

  it('returns error for missing domain', () => {
    expect(validateEmail('user@')).toBe('Enter a valid email address.')
  })

  it('returns empty string for valid email', () => {
    expect(validateEmail('user@example.com')).toBe('')
  })

  it('trims surrounding whitespace before validating', () => {
    expect(validateEmail('  user@example.com  ')).toBe('')
  })
})

describe('validatePassword', () => {
  it('returns error when empty', () => {
    expect(validatePassword('')).toBe('Password is required.')
  })

  it('fails the 8 character minimum', () => {
    expect(validatePassword('Ab1!')).toBe('At least 8 characters.')
  })

  it('fails when no uppercase letter', () => {
    expect(validatePassword('abcdefg1!')).toBe('At least 1 uppercase letter.')
  })

  it('fails when no lowercase letter', () => {
    expect(validatePassword('ABCDEFG1!')).toBe('At least 1 lowercase letter.')
  })

  it('fails when no digit', () => {
    expect(validatePassword('Abcdefg!!')).toBe('At least 1 digit.')
  })

  it('fails when no special character', () => {
    expect(validatePassword('Abcdefg1')).toBe('At least 1 special character.')
  })

  it('returns empty string for fully valid password', () => {
    expect(validatePassword('Correct1!')).toBe('')
  })
})

describe('validateAll', () => {
  it('returns both errors when both fields are empty', () => {
    const result = validateAll({ email: '', password: '', rememberMe: false })
    expect(result.email).toBeTruthy()
    expect(result.password).toBeTruthy()
  })

  it('returns no errors for fully valid fields', () => {
    const result = validateAll({
      email: 'user@example.com',
      password: 'Correct1!',
      rememberMe: false,
    })
    expect(result.email).toBe('')
    expect(result.password).toBe('')
  })

  it('reports only the email error when password is valid', () => {
    const result = validateAll({
      email: 'bad',
      password: 'Correct1!',
      rememberMe: false,
    })
    expect(result.email).toBeTruthy()
    expect(result.password).toBe('')
  })
})
