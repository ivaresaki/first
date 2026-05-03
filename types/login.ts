export type FormFields = {
  email: string
  password: string
  rememberMe: boolean
}

export type FormErrors = {
  email: string
  password: string
}

export type UseLoginReturn = {
  fields: FormFields
  errors: FormErrors
  isLoading: boolean
  authError: string
  showPassword: boolean
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  toggleShowPassword: () => void
}
