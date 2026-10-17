import dns from 'node:dns'
import http from 'node:http'
import https from 'node:https'
import net from 'node:net'
import zlib from 'node:zlib'
import type { Readable } from 'node:stream'

/**
 * Bezbedno preuzimanje tuđih stranica/slika SA SERVERA.
 *
 * Zašto ovo postoji: kada server preuzima adresu koju je neko uneo, napadač bi mogao da
 * natera server da pročita nešto što ne sme (interne servise, metadata servere hosting
 * provajdera, localhost). To se zove SSRF. Zaštita:
 *  - samo http/https, samo portovi 80/443, bez korisničkog imena/lozinke u adresi
 *  - provera IP adrese PRI SAMOM povezivanju (custom lookup), pa DNS trik ne prolazi
 *  - svaki redirect se proverava ponovo
 *  - ograničenje veličine (i posle raspakivanja) i vremena
 */

export class FetchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FetchError'
  }
}

// ───────────── Provera IP adresa ─────────────

function v4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0
}

function inV4Range(ip: number, base: string, bits: number): boolean {
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0
  return (ip & mask) === (v4ToInt(base) & mask)
}

const BLOCKED_V4: [string, number][] = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
]

function isBlockedV4(ip: string): boolean {
  const n = v4ToInt(ip)
  return BLOCKED_V4.some(([base, bits]) => inV4Range(n, base, bits))
}

function expandV6(ip: string): number[] | null {
  let addr = ip.toLowerCase()
  const zone = addr.indexOf('%')
  if (zone !== -1) addr = addr.slice(0, zone)

  // IPv4 na kraju (npr. ::ffff:1.2.3.4) -> dva heksa bloka
  const lastColon = addr.lastIndexOf(':')
  const tail = addr.slice(lastColon + 1)
  if (tail.includes('.')) {
    if (!net.isIPv4(tail)) return null
    const n = v4ToInt(tail)
    addr = `${addr.slice(0, lastColon + 1)}${(n >>> 16).toString(16)}:${(n & 0xffff).toString(16)}`
  }

  const halves = addr.split('::')
  if (halves.length > 2) return null
  const head = halves[0] ? halves[0].split(':') : []
  const rest = halves.length === 2 && halves[1] ? halves[1].split(':') : []
  const missing = 8 - head.length - rest.length
  if (halves.length === 1 ? head.length !== 8 : missing < 0) return null
  const groups = halves.length === 1 ? head : [...head, ...Array(missing).fill('0'), ...rest]
  const nums = groups.map((g) => parseInt(g, 16))
  if (nums.length !== 8 || nums.some((x) => Number.isNaN(x) || x < 0 || x > 0xffff)) return null
  return nums
}

function v4FromHextets(hi: number, lo: number): string {
  return `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`
}

function isBlockedV6(ip: string): boolean {
  const h = expandV6(ip)
  if (!h) return true // ne umemo da pročitamo -> ne verujemo

  const allZeroFirst5 = h.slice(0, 5).every((x) => x === 0)
  if (h.slice(0, 6).every((x) => x === 0)) return true // ::, ::1 i "IPv4-compatible"
  if (allZeroFirst5 && h[5] === 0xffff) return isBlockedV4(v4FromHextets(h[6], h[7])) // ::ffff:a.b.c.d
  if (h[0] === 0x64 && h[1] === 0xff9b && h.slice(2, 6).every((x) => x === 0))
    return isBlockedV4(v4FromHextets(h[6], h[7])) // NAT64
  if (h[0] === 0x2002) return isBlockedV4(v4FromHextets(h[1], h[2])) // 6to4
  if ((h[0] & 0xfe00) === 0xfc00) return true // unique local
  if ((h[0] & 0xffc0) === 0xfe80) return true // link-local
  if ((h[0] & 0xff00) === 0xff00) return true // multicast
  if (h[0] === 0x2001 && h[1] === 0x0db8) return true // dokumentacija
  if (h[0] === 0x0100 && h.slice(1, 4).every((x) => x === 0)) return true // discard
  return false
}

export function isBlockedIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isBlockedV4(ip)
  if (net.isIPv6(ip)) return isBlockedV6(ip)
  return true
}

// ───────────── Provera adrese ─────────────

export function validatePublicUrl(raw: string): URL {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    throw new FetchError('Adresa nije ispravna. Zalepi ceo link, počevši sa https://')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new FetchError('Dozvoljene su samo http i https adrese.')
  }
  if (url.username || url.password) {
    throw new FetchError('Adresa ne sme da sadrži korisničko ime ili lozinku.')
  }
  const port = url.port
  if (port && port !== '80' && port !== '443') {
    throw new FetchError('Ta adresa koristi nedozvoljen port.')
  }
  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new FetchError('Ta adresa nije javna.')
  }
  if (net.isIP(host) && isBlockedIp(host)) {
    throw new FetchError('Ta adresa nije javna.')
  }
  return url
}

// DNS lookup koji odbija privatne adrese — koristi se TAČNO ona adresa koja je provereno javna
function guardedLookup(
  hostname: string,
  options: dns.LookupOptions | number | undefined,
  callback: (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void
) {
  const opts: dns.LookupOptions = typeof options === 'object' && options ? options : {}
  dns.lookup(hostname, { ...opts, all: true }, (err, addresses) => {
    if (err) return callback(err, '', 0)
    const list = addresses as dns.LookupAddress[]
    if (list.length === 0 || list.some((a) => isBlockedIp(a.address))) {
      const e = new Error('Blocked address') as NodeJS.ErrnoException
      e.code = 'EBLOCKED'
      return callback(e, '', 0)
    }
    if (opts.all) return callback(null, list)
    return callback(null, list[0].address, list[0].family)
  })
}

// ───────────── Preuzimanje ─────────────

export interface FetchResult {
  finalUrl: string
  contentType: string
  buffer: Buffer
}

interface FetchOptions {
  maxBytes: number
  timeoutMs?: number
  accept?: string
  maxRedirects?: number
}

const USER_AGENT = 'Mozilla/5.0 (compatible; ZrenjaninDanasImport/1.0; +https://zrenjanindanas.com)'

function requestOnce(url: URL, opts: Required<Pick<FetchOptions, 'timeoutMs' | 'accept'>>): Promise<http.IncomingMessage> {
  return new Promise((resolve, reject) => {
    const lib = url.protocol === 'https:' ? https : http
    const req = lib.request(
      url,
      {
        method: 'GET',
        lookup: guardedLookup as unknown as net.LookupFunction,
        timeout: opts.timeoutMs,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: opts.accept,
          'Accept-Language': 'sr,hr;q=0.8,en;q=0.6',
          'Accept-Encoding': 'gzip, deflate, br',
        },
      },
      resolve
    )
    req.on('timeout', () => req.destroy(new FetchError('Sajt predugo odgovara.')))
    req.on('error', (e: NodeJS.ErrnoException) => {
      if (e instanceof FetchError) return reject(e)
      if (e.code === 'EBLOCKED') return reject(new FetchError('Ta adresa nije javna.'))
      if (e.code === 'ENOTFOUND' || e.code === 'EAI_AGAIN') return reject(new FetchError('Sajt sa te adrese ne postoji ili je nedostupan.'))
      reject(new FetchError('Ne mogu da se povežem sa tim sajtom.'))
    })
    req.end()
  })
}

function readBody(res: http.IncomingMessage, maxBytes: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    let stream: Readable = res
    const enc = String(res.headers['content-encoding'] || '').toLowerCase().trim()
    if (enc === 'gzip' || enc === 'x-gzip') stream = res.pipe(zlib.createGunzip())
    else if (enc === 'deflate') stream = res.pipe(zlib.createInflate())
    else if (enc === 'br') stream = res.pipe(zlib.createBrotliDecompress())
    else if (enc && enc !== 'identity') return reject(new FetchError('Sajt koristi nepodržano kodiranje odgovora.'))

    const chunks: Buffer[] = []
    let total = 0
    stream.on('data', (chunk: Buffer) => {
      total += chunk.length
      if (total > maxBytes) {
        res.destroy()
        stream.destroy()
        reject(new FetchError('Stranica je prevelika za uvoz.'))
        return
      }
      chunks.push(chunk)
    })
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', () => reject(new FetchError('Preuzimanje stranice nije uspelo.')))
    res.on('error', () => reject(new FetchError('Preuzimanje stranice nije uspelo.')))
  })
}

export async function safeFetch(rawUrl: string, options: FetchOptions): Promise<FetchResult> {
  const timeoutMs = options.timeoutMs ?? 12_000
  const accept = options.accept ?? '*/*'
  const maxRedirects = options.maxRedirects ?? 4

  let url = validatePublicUrl(rawUrl)

  let timer: NodeJS.Timeout | undefined
  const overall = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new FetchError('Preuzimanje traje predugo.')), timeoutMs * 2)
  })

  const work = (async (): Promise<FetchResult> => {
    for (let hop = 0; hop <= maxRedirects; hop++) {
      const res = await requestOnce(url, { timeoutMs, accept })
      const status = res.statusCode ?? 0

      if (status >= 300 && status < 400 && res.headers.location) {
        res.resume()
        let next: URL
        try {
          next = new URL(res.headers.location, url)
        } catch {
          throw new FetchError('Sajt je vratio neispravno preusmeravanje.')
        }
        url = validatePublicUrl(next.toString())
        continue
      }

      if (status < 200 || status >= 300) {
        res.resume()
        if (status === 401 || status === 403) {
          throw new FetchError('Sajt ne dozvoljava automatsko preuzimanje (zaštićen je). Kopiraj tekst ručno.')
        }
        if (status === 404 || status === 410) throw new FetchError('Ta stranica ne postoji (greška 404).')
        throw new FetchError(`Sajt je vratio grešku (${status}).`)
      }

      const buffer = await readBody(res, options.maxBytes)
      return {
        finalUrl: url.toString(),
        contentType: String(res.headers['content-type'] || '').toLowerCase(),
        buffer,
      }
    }
    throw new FetchError('Previše preusmeravanja.')
  })()

  try {
    return await Promise.race([work, overall])
  } finally {
    clearTimeout(timer)
  }
}
