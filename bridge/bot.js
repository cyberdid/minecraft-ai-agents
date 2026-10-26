// One player = one process. Keeps a Mineflayer bot online and runs agent-written
// JavaScript programs on it (setup of arXiv:2610.22319, sec. 2.1).
//
//   node bot.js --name alpha --api 3101 --viewer 3007
//
// POST /run  {code, timeout}  -> runs `code` as the body of async (bot) => {...}
// GET  /status                -> position, health, inventory
// GET  /feed?since=N          -> recent programs + chat, for the dashboard

const http = require('http')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

process.on('unhandledRejection', (err) => {
  console.error('[unhandledRejection]', err && err.message ? err.message : err)
})
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err && err.stack ? err.stack : err)
})
const mineflayer = require('mineflayer')
const { pathfinder, goals, Movements } = require('mineflayer-pathfinder')
const { plugin: toolPlugin } = require('mineflayer-tool')
const { plugin: pvp } = require('mineflayer-pvp')
const armorManager = require('mineflayer-armor-manager')
const { Vec3 } = require('vec3')

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), [])
)
if (args.serverdir) process.env.MC_WORLD_DIR = path.resolve(args.serverdir, 'world') // before skills.js loads
const { createLib, HOSTILE } = require('./lib/skills')
const NAME = args.name || 'alpha'
const API_PORT = Number(args.api || 3101)
const VIEWER_PORT = Number(args.viewer || 0)
const MC_HOST = args.host || '127.0.0.1'
const MC_PORT = Number(args.port || 25565)
const MC_VERSION = args.version || '1.20.1'
const LOG_DIR = path.resolve(args.logdir || path.join(__dirname, '..', 'logs', NAME)) // --logdir for test bridges
const AGENTS_DIR = path.resolve(__dirname, '..', 'agents')
fs.mkdirSync(LOG_DIR, { recursive: true })

const MAX_OUT = 12000
const log = (file, obj) => fs.appendFileSync(path.join(LOG_DIR, file), JSON.stringify({ t: new Date().toISOString(), ...obj }) + '\n')

// Programs may load packages and harmless built-ins, but cannot start processes,
// touch files or the network (paper: "cannot start processes or write files").
const ALLOWED = new Set([
  'mineflayer', 'mineflayer-pathfinder', 'vec3', 'minecraft-data', 'prismarine-item',
  'prismarine-block', 'prismarine-entity', 'prismarine-recipe', 'prismarine-windows',
  'util', 'events', 'assert', 'path', 'timers', 'timers/promises', 'perf_hooks'
])
const safeRequire = (m) => {
  const bare = m.replace(/^node:/, '')
  if (!ALLOWED.has(bare)) throw new Error(`require('${m}') is not allowed in programs`)
  return require(bare)
}

// --- bot lifecycle --------------------------------------------------------

let bot = null
let viewerUp = false
const chat = [] // {i, t, from, text}
const events = [] // deaths, kicks, reconnects
let chatSeq = 0
let chatDelivered = 0
let programSeq = 0
let runGeneration = 0 // bumped on every timeout so leftover code can notice
let running = null
let lateOutput = []
let autoloaded = false

// Parking: a bot with no programs for PARK_MS logs out, so an idle player
// isn't killed over and over (44 deaths in one idle night) and doesn't draw
// creepers to the base. The next program logs it back in. While parked, chat
// and server events are read from the server log so nothing is missed.
const PARK_MS = Number(args.park || 5) * 60 * 1000
const SERVER_LOG = path.resolve(args.serverdir || path.join(__dirname, '..', 'server', 'data'), 'logs', 'latest.log')
let parked = false
let lastActivity = Date.now()
let logOffset = 0
let logTimer = null

function pushChat(from, text) {
  const entry = { i: ++chatSeq, t: new Date().toISOString(), from, text }
  chat.push(entry)
  if (chat.length > 500) chat.shift()
  log('chat.jsonl', entry)
}

function pushEvent(text) {
  events.push({ t: new Date().toISOString(), text })
  if (events.length > 50) events.shift()
  log('events.jsonl', { text })
}

function connect() {
  bot = mineflayer.createBot({ host: MC_HOST, port: MC_PORT, username: NAME, version: MC_VERSION, auth: 'offline' })
  bot.loadPlugin(pathfinder)
  bot.loadPlugin(toolPlugin) // best tool for a block: bot.tool.equipForBlock
  bot.loadPlugin(pvp)
  bot.loadPlugin(armorManager) // wears the best armor it picks up

  bot.once('spawn', async () => {
    pushEvent(`spawned at ${fmtPos()}`)
    sandbox.mcData = require('minecraft-data')(bot.version)
    try {
      const { loader } = await import('mineflayer-auto-eat')
      bot.loadPlugin(loader)
      bot.autoEat.setOpts({ minHunger: 14, bannedFood: ['rotten_flesh', 'spider_eye', 'poisonous_potato', 'pufferfish', 'chicken', 'beef', 'porkchop', 'mutton', 'rabbit', 'cod', 'salmon'] /* raw meat is for cooking; lib.eat() still eats it */ })
      bot.autoEat.enableAuto()
    } catch (e) {
      pushEvent(`auto-eat failed: ${e.message}`)
    }
    if (!autoloaded) { autoloaded = true; await runAutoload() }
    if (VIEWER_PORT && !viewerUp) {
      try {
        require('./viewer')(bot, { port: VIEWER_PORT, name: NAME, viewDistance: 6 }) // chase camera
        viewerUp = true
      } catch (e) {
        pushEvent(`viewer failed: ${e.message}`)
      }
    }
  })
  bot.on('messagestr', (text, position) => {
    if (position === 'game_info') return
    pushChat(position === 'chat' ? 'chat' : 'server', text)
  })
  bot.on('death', () => pushEvent(`died at ${fmtPos()}`))
  bot.on('respawn', () => pushEvent('respawned'))
  bot.on('kicked', (reason) => pushEvent(`kicked: ${typeof reason === 'string' ? reason : JSON.stringify(reason)}`))
  bot.on('error', (err) => pushEvent(`error: ${err.message}`))
  bot.on('end', (reason) => {
    if (bot.viewer) { try { bot.viewer.close() } catch {} viewerUp = false }
    if (parked) return
    pushEvent(`disconnected (${reason}); reconnecting in 5s`)
    setTimeout(connect, 5000)
  })
}

function park() {
  parked = true
  pushEvent(`parked: logged out after ${PARK_MS / 60000} min without programs at ${fmtPos()}; the next program logs back in`)
  try { logOffset = fs.statSync(SERVER_LOG).size } catch { logOffset = 0 }
  logTimer = setInterval(readServerLog, 2000)
  bot.quit('parked')
}

async function unpark() {
  readServerLog()
  clearInterval(logTimer)
  parked = false
  connect()
  const until = Date.now() + 40000
  while (!(bot && bot.entity) && Date.now() < until) await new Promise((r) => setTimeout(r, 250))
  await new Promise((r) => setTimeout(r, 1000)) // let chunks arrive
  pushEvent(`unparked at ${fmtPos()}`)
}

const LOG_EVENT = /^<\w+> | joined the game$| left the game$|has made the advancement|has completed the challenge|has reached the goal|^\w+ (was |died|drowned|fell |hit the ground|burned|blew up|tried to swim|walked into|went up in flames|went off with|starved|suffocated|froze|experienced kinetic|withered|discovered the floor|didn't want to live)/
function readServerLog() {
  try {
    const size = fs.statSync(SERVER_LOG).size
    if (size < logOffset) logOffset = 0 // new log after a server restart
    if (size === logOffset) return
    const fd = fs.openSync(SERVER_LOG, 'r')
    const buf = Buffer.alloc(size - logOffset)
    fs.readSync(fd, buf, 0, buf.length, logOffset)
    fs.closeSync(fd)
    logOffset = size
    for (const line of buf.toString('utf8').split('\n')) {
      const m = line.match(/\[Server thread\/INFO\]: (?:\[Not Secure\] )?(.*)$/) // offline-mode chat is tagged [Not Secure]
      if (m && LOG_EVENT.test(m[1].trim())) pushChat(m[1].startsWith('<') ? 'chat' : 'server', m[1].trim())
    }
  } catch {}
}

setInterval(() => {
  if (!parked && !running && bot && bot.entity && Date.now() - lastActivity > PARK_MS) park()
}, 30000)

const fmtPos = () => (bot && bot.entity ? `(${bot.entity.position.x.toFixed(1)}, ${bot.entity.position.y.toFixed(1)}, ${bot.entity.position.z.toFixed(1)})` : '(not spawned)')

function status() {
  if (parked) return { online: false, parked: true, name: NAME }
  if (!bot || !bot.entity) return { online: false }
  const inv = {}
  for (const it of bot.inventory.items()) inv[it.name] = (inv[it.name] || 0) + it.count
  const t = lib.time()
  const near = Object.values(bot.entities)
    .filter((e) => e.position && HOSTILE.has(e.name) && e.position.distanceTo(bot.entity.position) <= 16)
    .map((e) => `${e.name} ${e.position.distanceTo(bot.entity.position).toFixed(0)}m`)
  return {
    online: true,
    name: NAME,
    position: fmtPos(),
    dimension: bot.game.dimension,
    health: +bot.health.toFixed(1),
    food: bot.food,
    timeOfDay: bot.time.timeOfDay,
    phase: t.phase,
    secondsUntilNight: t.secondsUntilNight,
    hostiles: near,
    held: bot.heldItem ? bot.heldItem.name : null,
    tools: lib.tools(),
    armor: [5, 6, 7, 8].map((i) => bot.inventory.slots[i]?.name).filter(Boolean),
    inventory: inv
  }
}

// --- running programs -----------------------------------------------------

// One persistent context: values stored on globalThis survive between programs.
const lib = createLib(() => bot, { gen: () => runGeneration })
const sandbox = {
  setTimeout, clearTimeout, setInterval, clearInterval, setImmediate, clearImmediate,
  require: safeRequire,
  Buffer,
  Vec3, goals, Movements, lib,
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms))
}
const context = vm.createContext(sandbox)
lib.reflexes(true)

// Agents' own helpers survive bridge restarts: run team/autoload.js and
// <name>/autoload.js once, after the first spawn.
async function runAutoload () {
  if (args.test) return // test bridges don't run the agents' helpers
  for (const file of [path.join(AGENTS_DIR, 'team', 'autoload.js'), path.join(AGENTS_DIR, NAME, 'autoload.js')]) {
    if (!fs.existsSync(file)) continue
    const r = await runProgram(fs.readFileSync(file, 'utf8'), 60)
    pushEvent(`autoload ${path.relative(AGENTS_DIR, file)}: ${r.error ? 'ERROR ' + r.error.split('\n')[0] : 'ok'}`)
  }
}

function format(v) {
  if (typeof v === 'string') return v
  try { return JSON.stringify(v) } catch { return String(v) }
}

async function runProgram(code, timeoutSec) {
  const id = ++programSeq
  const gen = runGeneration
  const out = []
  let size = 0
  const write = (prefix) => (...a) => {
    const line = (prefix ? prefix + ' ' : '') + a.map(format).join(' ')
    if (gen !== runGeneration || running?.id !== id) { lateOutput.push(`[late, program #${id}] ${line}`); return }
    if (size < MAX_OUT) { out.push(line); size += line.length }
  }
  const progConsole = { log: write(''), info: write(''), warn: write('[warn]'), error: write('[error]') }
  const isCancelled = () => gen !== runGeneration

  const started = Date.now()
  running = { id, started }
  let result, error, timedOut = false
  let timer
  try {
    const fn = vm.runInContext(`(async (bot, console, isCancelled) => {\n${code}\n})`, context, { filename: `program-${id}.js` })
    result = await Promise.race([
      fn(bot, progConsole, isCancelled),
      new Promise((_, rej) => { timer = setTimeout(() => { timedOut = true; rej(new Error(`timed out after ${timeoutSec}s`)) }, timeoutSec * 1000) })
    ])
  } catch (e) {
    error = e && e.stack ? e.stack.split('\n').slice(0, 6).join('\n') : String(e)
  } finally {
    clearTimeout(timer)
    running = null
  }
  if (timedOut) {
    runGeneration++ // leftover code sees isCancelled() === true
    try { bot.pathfinder.stop(); bot.clearControlStates(); bot.stopDigging() } catch {}
    try { bot.pvp.stop() } catch {}
  }
  const late = lateOutput.splice(0)
  // Everything heard since the previous program returned, not only during this one.
  const newChat = chat.filter((c) => c.i > chatDelivered)
  chatDelivered = chatSeq
  const record = {
    id, timeout: timeoutSec, seconds: (Date.now() - started) / 1000,
    code, output: out.join('\n'), result: result === undefined ? undefined : format(result).slice(0, MAX_OUT),
    error, status: status(), newChat, events: events.splice(0), late
  }
  log('programs.jsonl', record)
  return record
}

// --- HTTP API ---------------------------------------------------------------

function body(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (c) => (data += c))
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}) } catch (e) { reject(e) } })
  })
}

http.createServer(async (req, res) => {
  const send = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json', 'access-control-allow-origin': '*' }); res.end(JSON.stringify(obj)) }
  try {
    const url = new URL(req.url, 'http://x')
    if (req.method === 'GET' && url.pathname === '/status') return send(200, status())
    if (req.method === 'GET' && url.pathname === '/feed') {
      const lines = readTail(path.join(LOG_DIR, 'programs.jsonl'), 15)
      return send(200, { name: NAME, status: status(), running, programs: lines, chat: chat.slice(-30) })
    }
    if (req.method === 'POST' && url.pathname === '/run') {
      lastActivity = Date.now()
      if (parked && !running) await unpark()
      if (!bot || !bot.entity) return send(503, { error: 'bot is not in the world yet (reconnecting?)' })
      if (running) return send(409, { error: `program #${running.id} is still running` })
      const { code, timeout } = await body(req)
      if (typeof code !== 'string' || !code.trim()) return send(400, { error: 'empty program' })
      const t = Math.min(Math.max(Number(timeout) || 60, 1), 900)
      const result = await runProgram(code, t)
      lastActivity = Date.now()
      return send(200, result)
    }
    send(404, { error: 'not found' })
  } catch (e) {
    send(500, { error: e.message })
  }
}).listen(API_PORT, '127.0.0.1', () => console.log(`[${NAME}] api on :${API_PORT}${VIEWER_PORT ? `, viewer on :${VIEWER_PORT}` : ''}`))

function readTail(file, n) {
  if (!fs.existsSync(file)) return []
  const lines = fs.readFileSync(file, 'utf8').trim().split('\n').slice(-n)
  return lines.map((l) => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
}

connect()
