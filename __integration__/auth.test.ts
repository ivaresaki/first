import { describe, it, expect, beforeAll } from 'vitest'
import { initializeApp, getApps, FirebaseError } from 'firebase/app'
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  deleteUser,
} from 'firebase/auth'

// Uses a named app instance to avoid conflicting with the lib/firebase.ts singleton.
const testApp =
  getApps().find(a => a.name === 'integration-test') ??
  initializeApp(
    {
      apiKey: 'test-api-key',
      authDomain: 'localhost',
      projectId: 'nextjs-firebase-app-1ff04',
    },
    'integration-test',
  )

const auth = getAuth(testApp)

beforeAll(() => {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
})

const TEST_EMAIL = `integration-${Date.now()}@example.com`
const TEST_PASSWORD = 'Correct1!'

describe('Firebase Auth emulator — signInWithEmailAndPassword', () => {
  it('rejects for unknown user', async () => {
    // The emulator returns auth/user-not-found; production Firebase consolidates
    // this into auth/invalid-credential. Accept either.
    const INVALID_CREDENTIAL_CODES = new Set([
      'auth/invalid-credential',
      'auth/user-not-found',
    ])
    await expect(
      signInWithEmailAndPassword(auth, 'nobody@example.com', 'WrongPass1!'),
    ).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof FirebaseError && INVALID_CREDENTIAL_CODES.has(err.code),
    )
  })

  it('signs in successfully after creating the user', async () => {
    const cred = await createUserWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD)
    expect(cred.user.email).toBe(TEST_EMAIL)

    const signInCred = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD)
    expect(signInCred.user.email).toBe(TEST_EMAIL)

    await deleteUser(signInCred.user)
  })
})
