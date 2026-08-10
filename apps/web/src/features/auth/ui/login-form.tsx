'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import {
  LoginInputSchema,
  type LoginInput,
} from '@lustra/contracts'

import { ApiError } from '@/shared/api/http'
import { login } from '@/shared/api/auth-client'
import styles from './auth-form.module.css'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsed = LoginInputSchema.safeParse({ email, password } satisfies LoginInput)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Проверьте поля')
      return
    }

    setPending(true)
    try {
      await login(parsed.data)
      router.push('/app')
      router.refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Не удалось войти')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <label className={styles.field}>
        <span>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className={styles.field}>
        <span>Пароль</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </label>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? 'Входим…' : 'Войти'}
      </button>
    </form>
  )
}
