'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Auth } from 'firebase/auth'
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import { validateEmail, validatePassword, validateAll } from '@/lib/validation'
import { firebaseErrorMessage } from '@/lib/authErrors'
import type { FormFields, FormErrors, UseLoginReturn } from '@/types/login'

const STORAGE_KEY = 'login_remembered_email'

export function useLogin(auth: Auth): UseLoginReturn {
  const router = useRouter()

  const [fields, setFields] = useState<FormFields>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState<FormErrors>({ email: '', password: '' })
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')

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
    setAuthError('')

    if (hasSubmitted) {
      if (name === 'email') {
        setErrors(prev => ({ ...prev, email: validateEmail(value) }))
      } else if (name === 'password') {
        setErrors(prev => ({ ...prev, password: validatePassword(value) }))
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setHasSubmitted(true)
    setAuthError('')

    const newErrors = validateAll(fields)
    setErrors(newErrors)
    if (newErrors.email || newErrors.password) return

    setIsLoading(true)
    try {
      await setPersistence(
        auth,
        fields.rememberMe ? browserLocalPersistence : browserSessionPersistence,
      )
      await signInWithEmailAndPassword(auth, fields.email.trim(), fields.password)

      if (fields.rememberMe) {
        localStorage.setItem(STORAGE_KEY, fields.email.trim())
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }

      router.push('/')
    } catch (err) {
      if (err instanceof FirebaseError) {
        setAuthError(firebaseErrorMessage(err))
      } else {
        setAuthError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  function toggleShowPassword() {
    setShowPassword(prev => !prev)
  }

  return {
    fields,
    errors,
    isLoading,
    authError,
    showPassword,
    handleChange,
    handleSubmit,
    toggleShowPassword,
  }
}
