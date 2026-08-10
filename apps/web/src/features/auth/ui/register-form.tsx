'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import {
  RegisterInputSchema,
  type RegisterRole,
} from '@lustra/contracts'

import { ApiError } from '@/shared/api/http'
import { register } from '@/shared/api/auth-client'
import styles from './auth-form.module.css'

export function RegisterForm() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<RegisterRole>('client')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsed = RegisterInputSchema.safeParse({
      firstName,
      email,
      password,
      role,
      acceptTerms: acceptTerms ? true : false,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Проверьте поля')
      return
    }

    setPending(true)
    try {
      await register(parsed.data)
      router.push('/app')
      router.refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Не удалось зарегистрироваться')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <fieldset className={styles.roleGroup}>
        <legend>Я регистрируюсь как</legend>
        <label className={styles.roleOption}>
          <input
            type="radio"
            name="role"
            value="client"
            checked={role === 'client'}
            onChange={() => setRole('client')}
          />
          Клиент
        </label>
        <label className={styles.roleOption}>
          <input
            type="radio"
            name="role"
            value="master"
            checked={role === 'master'}
            onChange={() => setRole('master')}
          />
          Мастер
        </label>
      </fieldset>

      <label className={styles.field}>
        <span>Имя</span>
        <input
          type="text"
          name="firstName"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </label>
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </label>

      <label className={styles.check}>
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
        />
        <span>Принимаю условия использования и политику конфиденциальности</span>
      </label>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? 'Создаём…' : 'Зарегистрироваться'}
      </button>
    </form>
  )
}
