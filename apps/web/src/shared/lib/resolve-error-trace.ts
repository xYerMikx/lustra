function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readStringField(value: unknown, key: string): string | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  const field = value[key]

  if (typeof field !== 'string' || field.length === 0) {
    return undefined
  }

  return field
}

export function resolveErrorTrace(
  error: unknown,
  storedRequestId?: string,
): string | undefined {
  const fromError = readStringField(error, 'requestId')

  if (fromError) {
    return fromError
  }

  if (storedRequestId) {
    return storedRequestId
  }

  return readStringField(error, 'digest')
}
