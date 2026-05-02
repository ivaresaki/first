'use client'

import { useState, useEffect, useId } from 'react'
import { EyeOpenIcon, EyeClosedIcon } from './EyeIcons'

type FormFields = {
  email: string
  password: string
  rememberMe: boolean
}

type FormErrors = {
  email: string
  password: string
}

const STORAGE_KEY = 'login_remembered_email'

function validateEmail(value: string): string {
  if (!value.trim()) return 'Email is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return 'Enter a valid email address.'
  }
  return ''
}

function validatePassword(value: string): string {
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

function validateAll(fields: FormFields): FormErrors {
  return {
    email: validateEmail(fields.email),
    password: validatePassword(fields.password),
  }
}

export default function LoginForm() {
  const [fields, setFields] = useState<FormFields>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState<FormErrors>({ email: '', password: '' })
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const emailId = useId()
  const passwordId = useId()
  const rememberMeId = useId()

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setFields(prev => ({ ...prev, email: saved, rememberMe: true }))
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value

    setFields(prev => ({ ...prev, [name]: newValue }))

    if (hasSubmitted) {
      if (name === 'email') {
        setErrors(prev => ({ ...prev, email: validateEmail(value) }))
      } else if (name === 'password') {
        setErrors(prev => ({ ...prev, password: validatePassword(value) }))
      }
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setHasSubmitted(true)

    const newErrors = validateAll(fields)
    setErrors(newErrors)

    if (newErrors.email || newErrors.password) return

    if (fields.rememberMe) {
      localStorage.setItem(STORAGE_KEY, fields.email)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }

    setIsSuccess(true)
  }

  const inputClass =
    'w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'

  if (isSuccess) {
    return (
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 shadow-lg p-8 sm:p-10 text-center">
        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
          Login successful!
        </p>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          This is a UI demo — no backend is connected.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 shadow-lg p-8 sm:p-10">
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-6">
        Sign in to your account
      </h1>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* Email */}
        <div>
          <label
            htmlFor={emailId}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Email address
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={inputClass}
          />
          {errors.email && (
            <p role="alert" className="mt-1 text-xs text-red-500 dark:text-red-400">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor={passwordId}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              id={passwordId}
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={fields.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 focus:outline-none"
            >
              {showPassword ? (
                <EyeClosedIcon className="h-5 w-5" />
              ) : (
                <EyeOpenIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p role="alert" className="mt-1 text-xs text-red-500 dark:text-red-400">
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={rememberMeId}
            name="rememberMe"
            checked={fields.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 accent-blue-600"
          />
          <label
            htmlFor={rememberMeId}
            className="text-sm text-neutral-600 dark:text-neutral-400 select-none"
          >
            Remember me
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
        >
          Sign in
        </button>
      </form>
    </div>
  )
}
