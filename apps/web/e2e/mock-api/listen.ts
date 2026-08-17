import { createServer } from 'node:http'

import { dispatch } from './dispatch'
import {
  parseCookies,
  readBody,
  sendBytes,
  sendJson,
  writeCors,
} from './http'
import { STUB_PNG } from '../stub-png'
import { createWorld } from './world'

const PORT = Number(process.env.E2E_MOCK_API_PORT ?? 3337)

let world = createWorld()
let holdTail: Promise<void> = Promise.resolve()

function runHoldSerialized<T>(fn: () => T): Promise<T> {
  const next = holdTail.then(() => fn())
  holdTail = next.then(
    () => undefined,
    () => undefined,
  )

  return next
}

const server = createServer(async (req, res) => {
  writeCors(req, res)

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()

    return
  }

  const host = req.headers.host ?? `127.0.0.1:${PORT}`
  const url = new URL(req.url ?? '/', `http://${host}`)
  const request = {
    method: req.method ?? 'GET',
    pathname: url.pathname,
    searchParams: url.searchParams,
    cookies: parseCookies(req.headers.cookie),
    csrfHeader: Array.isArray(req.headers['x-csrf-token'])
      ? req.headers['x-csrf-token'][0]
      : req.headers['x-csrf-token'],
    idempotencyKey: Array.isArray(req.headers['idempotency-key'])
      ? req.headers['idempotency-key'][0]
      : req.headers['idempotency-key'],
    body: await readBody(req),
  }

  if (request.method === 'GET' && request.pathname.startsWith('/__e2e/media/')) {
    sendBytes(res, STUB_PNG, 'image/png')

    return
  }

  if (request.method === 'POST' && request.pathname === '/__e2e/reset') {
    world = createWorld()
    sendJson(res, { status: 204 })

    return
  }

  let result

  if (request.method === 'POST' && request.pathname === '/bookings/holds') {
    result = await runHoldSerialized(() => dispatch(world, request))
  } else {
    result = dispatch(world, request)
  }

  sendJson(res, result.response, result.cookies)
})

server.listen(PORT, '127.0.0.1', () => {
  // eslint-disable-next-line no-console
  console.log(`Lustra e2e mock API on http://127.0.0.1:${PORT}`)
})
