#!/usr/bin/env node
// Command-line client the agents use to play (paper sec. 2.1).
//
//   mc run prog.js [--timeout 60]   run a program on your bot, print what came back
//   mc run - [--timeout 60]         same, program read from stdin
//   mc status                       position, health, inventory
//
// The bridge port comes from MC_BRIDGE_PORT.

const fs = require('fs')
const http = require('http')

const PORT = Number(process.env.MC_BRIDGE_PORT || 3101)
const [cmd, file, ...rest] = process.argv.slice(2)

function request(method, path, payload, timeoutMs) {
  return new Promise((resolve, reject) => {
    const data = payload ? JSON.stringify(payload) : null
    const req = http.request({ host: '127.0.0.1', port: PORT, method, path, headers: data ? { 'content-type': 'application/json' } : {} }, (res) => {
      let buf = ''
      res.on('data', (c) => (buf += c))
      res.on('end', () => { try { resolve(JSON.parse(buf)) } catch { resolve({ error: buf }) } })
    })
    req.setTimeout(timeoutMs, () => req.destroy(new Error('bridge did not answer in time')))
    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

function printStatus(s) {
  if (s && s.parked) return console.log('STATUS: parked (logged out after a few idle minutes so monsters cannot kill you; any ./mc run logs you back in where you were)')
  if (!s || !s.online) return console.log('STATUS: bot offline (reconnecting?)')
  const inv = Object.entries(s.inventory).map(([k, v]) => `${k}x${v}`).join(', ') || 'empty'
  console.log(`STATUS: ${s.name} at ${s.position} in ${s.dimension} | health ${s.health}/20 food ${s.food}/20 | held ${s.held}`)
  console.log(`TIME: ${s.timeOfDay} ${s.phase}${s.secondsUntilNight ? ` | night in ${s.secondsUntilNight}s` : ''}`)
  console.log(`HOSTILES within 16: ${s.hostiles.length ? s.hostiles.join(', ') : 'none'}`)
  const tools = Object.entries(s.tools || {}).map(([k, v]) => `${k} ${v}`).join(', ')
  if (tools || (s.armor && s.armor.length)) console.log(`GEAR: ${tools || 'no tools'}${s.armor && s.armor.length ? ' | wearing ' + s.armor.join(', ') : ''}`)
  console.log(`INVENTORY: ${inv}`)
}

async function main() {
  if (cmd === 'status') return printStatus(await request('GET', '/status', null, 10000))
  if (cmd !== 'run' || !file) {
    console.error('usage: mc run <file.js|-> [--timeout SECONDS] | mc status')
    process.exit(2)
  }
  const ti = rest.indexOf('--timeout')
  const timeout = ti >= 0 ? Number(rest[ti + 1]) : 60
  const code = fs.readFileSync(file === '-' ? 0 : file, 'utf8')
  const r = await request('POST', '/run', { code, timeout }, (timeout + 30) * 1000)
  if (r.id === undefined) { console.log(`BRIDGE ERROR: ${r.error}`); process.exit(1) }

  console.log(`PROGRAM #${r.id} ran ${r.seconds.toFixed(1)}s (timeout ${r.timeout}s)`)
  if (r.output) console.log(`--- output ---\n${r.output}`)
  if (r.result !== undefined) console.log(`--- returned ---\n${r.result}`)
  if (r.error) console.log(`--- ERROR ---\n${r.error}`)
  if (r.late && r.late.length) console.log(`--- output from earlier programs still running ---\n${r.late.join('\n')}`)
  if (r.events && r.events.length) console.log(`--- events ---\n${r.events.map((e) => `${e.t} ${e.text}`).join('\n')}`)
  if (r.newChat && r.newChat.length) console.log(`--- chat ---\n${r.newChat.map((c) => `${c.t} ${c.text}`).join('\n')}`)
  printStatus(r.status)
  process.exit(r.error ? 1 : 0)
}

main().catch((e) => { console.log(`BRIDGE ERROR: ${e.message}`); process.exit(1) })
