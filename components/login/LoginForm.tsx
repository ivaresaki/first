'use client'

import { useId } from 'react'
import { auth } from '@/lib/firebase'
import { useLogin } from '@/hooks/useLogin'
import { EyeOpenIcon, EyeClosedIcon } from './EyeIcons'

const inputClass =
  'w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'

export default function LoginForm() {
  const emailId = useId()
  const passwordId = useId()
  const rememberMeId = useId()

  const {
    fields,
    errors,
    isLoading,
    authError,
    showPassword,
    handleChange,
    handleSubmit,
    toggleShowPassword,
  } = useLogin(auth)

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
            disabled={isLoading}
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
              disabled={isLoading}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={toggleShowPassword}
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
            disabled={isLoading}
            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600 accent-blue-600"
          />
          <label
            htmlFor={rememberMeId}
            className="text-sm text-neutral-600 dark:text-neutral-400 select-none"
          >
            Remember me
          </label>
        </div>

        {authError && (
          <p role="alert" className="text-sm text-red-500 dark:text-red-400">
            {authError}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer"
        >
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
