import type {
  AuthSessionResponse,
  ForgotPasswordInput,
  LoginInput,
  MeResponse,
  OkResponse,
  RegisterInput,
  ResetPasswordInput,
} from '@lustra/contracts'

import { apiFetch } from './http'

export function register(input: RegisterInput) {
  return apiFetch<AuthSessionResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function login(input: LoginInput) {
  return apiFetch<AuthSessionResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function requestPasswordReset(input: ForgotPasswordInput) {
  return apiFetch<OkResponse>('/auth/password/forgot', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function resetPassword(input: ResetPasswordInput) {
  return apiFetch<OkResponse>('/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function logout() {
  return apiFetch('/auth/logout', { method: 'POST' })
}

export function refreshSession() {
  return apiFetch<AuthSessionResponse>('/auth/refresh', { method: 'POST' })
}

export function getMe() {
  return apiFetch<MeResponse>('/auth/me', { method: 'GET' })
}
