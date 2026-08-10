import Link from 'next/link'

type AuthHeaderProps = {
  variant: 'login' | 'register'
}

export function AuthHeader({ variant }: AuthHeaderProps) {
  return (
    <header className="site-header">
      <Link href="/" className="brand">
        Lustra
      </Link>
      <nav className="nav" aria-label="Основная навигация">
        <Link href="/">Главная</Link>
        <Link href="/catalog">Каталог</Link>
        {variant === 'login' ? (
          <Link href="/app/register">Регистрация</Link>
        ) : (
          <Link href="/app/login">Вход</Link>
        )}
      </nav>
    </header>
  )
}
