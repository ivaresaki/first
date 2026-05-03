import { describe, it, expect } from 'vitest'
import { FirebaseError } from 'firebase/app'
import { firebaseErrorMessage } from '@/lib/authErrors'

function makeError(code: string): FirebaseError {
  return new FirebaseError(code, 'firebase internal message')
}

describe('firebaseErrorMessage', () => {
  it.each([
    ['auth/invalid-credential', 'Invalid email or password.'],
    ['auth/user-not-found', 'Invalid email or password.'],
    ['auth/wrong-password', 'Invalid email or password.'],
    ['auth/user-disabled', 'This account has been disabled.'],
    ['auth/too-many-requests', 'Too many failed attempts. Please try again later.'],
    ['auth/network-request-failed', 'Network error. Check your connection and try again.'],
    ['auth/unknown-code', 'Something went wrong. Please try again.'],
  ])('maps %s correctly', (code, expected) => {
    expect(firebaseErrorMessage(makeError(code))).toBe(expected)
  })
})
