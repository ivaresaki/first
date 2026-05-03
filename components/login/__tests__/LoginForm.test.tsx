import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginForm from '@/components/login/LoginForm'
import type { UseLoginReturn } from '@/types/login'

vi.mock('@/lib/firebase', () => ({ auth: {} }))

const mockHandleChange = vi.fn()
const mockHandleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
const mockToggleShowPassword = vi.fn()

const defaultHookReturn: UseLoginReturn = {
  fields: { email: '', password: '', rememberMe: false },
  errors: { email: '', password: '' },
  isLoading: false,
  authError: '',
  showPassword: false,
  handleChange: mockHandleChange,
  handleSubmit: mockHandleSubmit,
  toggleShowPassword: mockToggleShowPassword,
}

vi.mock('@/hooks/useLogin', () => ({
  useLogin: vi.fn(() => defaultHookReturn),
}))

import { useLogin } from '@/hooks/useLogin'

beforeEach(() => {
  vi.mocked(useLogin).mockReturnValue({ ...defaultHookReturn })
  vi.clearAllMocks()
})

describe('LoginForm rendering', () => {
  it('renders email and password inputs', () => {
    render(<LoginForm />)
    expect(screen.getByRole('textbox', { name: /email address/i })).toBeDefined()
    expect(screen.getByPlaceholderText('••••••••')).toBeDefined()
  })

  it('renders Sign in button', () => {
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined()
  })

  it('renders "Signing in…" when isLoading', () => {
    vi.mocked(useLogin).mockReturnValue({ ...defaultHookReturn, isLoading: true })
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDefined()
  })

  it('disables inputs and button when isLoading', () => {
    vi.mocked(useLogin).mockReturnValue({ ...defaultHookReturn, isLoading: true })
    render(<LoginForm />)
    const emailInput = screen.getByRole('textbox', { name: /email address/i })
    expect((emailInput as HTMLInputElement).disabled).toBe(true)
    const submitBtn = screen.getByRole('button', { name: /signing in/i })
    expect((submitBtn as HTMLButtonElement).disabled).toBe(true)
  })

  it('shows email error when errors.email is set', () => {
    vi.mocked(useLogin).mockReturnValue({
      ...defaultHookReturn,
      errors: { email: 'Email is required.', password: '' },
    })
    render(<LoginForm />)
    expect(screen.getByText('Email is required.')).toBeDefined()
  })

  it('shows authError when set', () => {
    vi.mocked(useLogin).mockReturnValue({
      ...defaultHookReturn,
      authError: 'Invalid email or password.',
    })
    render(<LoginForm />)
    expect(screen.getByText('Invalid email or password.')).toBeDefined()
  })

  it('shows Show password button when showPassword is false', () => {
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /show password/i })).toBeDefined()
  })

  it('shows Hide password button when showPassword is true', () => {
    vi.mocked(useLogin).mockReturnValue({ ...defaultHookReturn, showPassword: true })
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /hide password/i })).toBeDefined()
  })
})

describe('LoginForm interaction', () => {
  it('calls handleChange when email input changes', () => {
    render(<LoginForm />)
    fireEvent.change(screen.getByRole('textbox', { name: /email address/i }), {
      target: { value: 'test@example.com' },
    })
    expect(mockHandleChange).toHaveBeenCalledOnce()
  })

  it('calls toggleShowPassword when eye button is clicked', () => {
    render(<LoginForm />)
    fireEvent.click(screen.getByRole('button', { name: /show password/i }))
    expect(mockToggleShowPassword).toHaveBeenCalledOnce()
  })

  it('calls handleSubmit when form is submitted', () => {
    render(<LoginForm />)
    const form = screen.getByRole('button', { name: /sign in/i }).closest('form')!
    fireEvent.submit(form)
    expect(mockHandleSubmit).toHaveBeenCalledOnce()
  })
})
