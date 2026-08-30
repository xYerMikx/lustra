import { TEST_ID } from '@/shared/lib/test-id'
import { ButtonLink } from '@/shared/ui/button'
import { StatusScreen } from '@/shared/ui/status-screen'

export function NotFoundScreen() {
  return (
    <StatusScreen
      kicker="404"
      title="Страница не найдена"
      message="Такой страницы нет. Проверьте адрес или вернитесь на главную."
      testId={TEST_ID.pageNotFound}
      actions={
        <>
          <ButtonLink href="/" data-testid={TEST_ID.appErrorHome}>
            На главную
          </ButtonLink>
          <ButtonLink
            href="/catalog"
            variant="ghost"
            data-testid={TEST_ID.notFoundCatalog}
          >
            Каталог
          </ButtonLink>
        </>
      }
    />
  )
}
