/**
 * JSON-LD for a `<script type="application/ld+json">` tag.
 * `JSON.stringify` alone leaves `<`, so review text like `</script>` could
 * break out of the tag. Unicode escapes are valid JSON and close that hole.
 */
export function serializeStructuredData(payload: unknown): string {
  return JSON.stringify(payload)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}
