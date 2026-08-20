export function submitWithSuccess<TArgs extends unknown[]>(
  mutate: (...args: TArgs) => Promise<void>,
  onSuccess: (text: string) => void,
  successText: string,
): (...args: TArgs) => Promise<void> {

  return async (...args: TArgs) => {
    await mutate(...args)

    onSuccess(successText)
  }
}
