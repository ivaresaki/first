import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { FirebaseError } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import { useLogin } from '@/hooks/useLogin'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Use vi.fn() directly inside the factory — variables are not in scope when hoisted.
vi.mock('firebase/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/auth')>()
  return {
    ...actual,
    setPersistence: vi.fn().mockResolvedValue(undefined),
    signInWithEmailAndPassword: vi.fn(),
  }
})

// Capture refs after mock is registered.
import * as firebaseAuth from 'firebase/auth'
const mockSetPersistence = vi.mocked(firebaseAuth.setPersistence)
const mockSignIn = vi.mocked(firebaseAuth.signInWithEmailAndPassword)

const fakeAuth = {} as Auth

beforeEach(() => {
  vi.clearAllMocks()
  mockSetPersistence.mockResolvedValue(undefined)
  localStorage.clear()
})

describe('useLogin — initial state', () => {
  it('starts with empty fields and no errors', () => {
    const { result } = renderHook(() => useLogin(fakeAuth))
    expect(result.current.fields.email).toBe('')
    expect(result.current.fields.password).toBe('')
    expect(result.current.errors.email).toBe('')
    expect(result.current.errors.password).toBe('')
    expect(result.current.isLoading).toBe(false)
    expect(result.current.authError).toBe('')
    expect(result.current.showPassword).toBe(false)
  })

  it('reads remembered email from localStorage on mount', () => {
    localStorage.setItem('login_remembered_email', 'saved@example.com')
    const { result } = renderHook(() => useLogin(fakeAuth))
    expect(result.current.fields.email).toBe('saved@example.com')
    expect(result.current.fields.rememberMe).toBe(true)
  })
})

describe('useLogin — handleChange', () => {
  it('updates field value on change', () => {
    const { result } = renderHook(() => useLogin(fakeAuth))
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'a@b.com', type: 'text', checked: false },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    expect(result.current.fields.email).toBe('a@b.com')
  })

  it('clears authError on any field change', () => {
    const { result } = renderHook(() => useLogin(fakeAuth))
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'test@example.com', type: 'text', checked: false },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    expect(result.current.authError).toBe('')
  })
})

describe('useLogin — toggleShowPassword', () => {
  it('toggles showPassword', () => {
    const { result } = renderHook(() => useLogin(fakeAuth))
    expect(result.current.showPassword).toBe(false)
    act(() => result.current.toggleShowPassword())
    expect(result.current.showPassword).toBe(true)
    act(() => result.current.toggleShowPassword())
    expect(result.current.showPassword).toBe(false)
  })
})

describe('useLogin — handleSubmit validation', () => {
  it('sets field errors on empty submit and does not call signIn', async () => {
    const { result } = renderHook(() => useLogin(fakeAuth))
    await act(async () => {
      result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>)
    })
    expect(result.current.errors.email).toBeTruthy()
    expect(result.current.errors.password).toBeTruthy()
    expect(mockSignIn).not.toHaveBeenCalled()
  })
})

describe('useLogin — handleSubmit success', () => {
  it('calls signIn with trimmed email, saves to localStorage when rememberMe, redirects', async () => {
    mockSignIn.mockResolvedValueOnce({} as never)
    const { result } = renderHook(() => useLogin(fakeAuth))

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: '  user@example.com  ', type: 'text', checked: false },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    act(() => {
      result.current.handleChange({
        target: { name: 'password', value: 'Correct1!', type: 'text', checked: false },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    act(() => {
      result.current.handleChange({
        target: { name: 'rememberMe', value: '', type: 'checkbox', checked: true },
      } as React.ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>)
    })

    expect(mockSignIn).toHaveBeenCalledWith(fakeAuth, 'user@example.com', 'Correct1!')
    expect(localStorage.getItem('login_remembered_email')).toBe('user@example.com')
    expect(mockPush).toHaveBeenCalledWith('/')
    expect(result.current.isLoading).toBe(false)
  })

  it('removes stored email when rememberMe is false', async () => {
    mockSignIn.mockResolvedValueOnce({} as never)
    localStorage.setItem('login_remembered_email', 'old@example.com')
    const { result } = renderHook(() => useLogin(fakeAuth))

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'new@example.com', type: 'text', checked: false },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    act(() => {
      result.current.handleChange({
        target: { name: 'password', value: 'Correct1!', type: 'text', checked: false },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    // Uncheck rememberMe (was set to true by the localStorage pre-fill on mount)
    act(() => {
      result.current.handleChange({
        target: { name: 'rememberMe', value: '', type: 'checkbox', checked: false },
      } as React.ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>)
    })

    expect(localStorage.getItem('login_remembered_email')).toBeNull()
  })
})

describe('useLogin — handleSubmit Firebase error', () => {
  it('sets authError from Firebase error code', async () => {
    mockSignIn.mockRejectedValueOnce(
      new FirebaseError('auth/invalid-credential', 'firebase msg'),
    )
    const { result } = renderHook(() => useLogin(fakeAuth))

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'user@example.com', type: 'text', checked: false },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    act(() => {
      result.current.handleChange({
        target: { name: 'password', value: 'Correct1!', type: 'text', checked: false },
      } as React.ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>)
    })

    expect(result.current.authError).toBe('Invalid email or password.')
    expect(result.current.isLoading).toBe(false)
  })

  it('sets generic authError for non-Firebase errors', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('network down'))
    const { result } = renderHook(() => useLogin(fakeAuth))

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'user@example.com', type: 'text', checked: false },
      } as React.ChangeEvent<HTMLInputElement>)
    })
    act(() => {
      result.current.handleChange({
        target: { name: 'password', value: 'Correct1!', type: 'text', checked: false },
      } as React.ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>)
    })

    expect(result.current.authError).toBe('Something went wrong. Please try again.')
  })
})
