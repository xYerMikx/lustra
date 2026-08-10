export type AuthUser = {
  id: string
  role: 'client' | 'master' | 'admin'
  email: string
}
