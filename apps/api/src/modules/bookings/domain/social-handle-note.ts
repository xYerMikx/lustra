export function socialHandleFromNote(note: string | null): string | null {
  if (!note) {
    return null
  }

  const match = note.trim().match(/^@([A-Za-z0-9._]{1,40})(?:\s|$)/)

  return match?.[1] ?? null
}

export function clientNoteFromHandle(socialHandle: string | null): string | null {
  if (!socialHandle) {
    return null
  }

  const handle = socialHandle.replace(/^@+/, '').trim()

  if (!handle) {
    return null
  }

  return `@${handle}`
}
