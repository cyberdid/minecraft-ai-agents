// 3D view of one bot that follows it by itself, always from above:
//  - the camera hangs over the player, a little to the south, looking down;
//    north stays up, so the picture doesn't spin when the bot turns its head;
//  - when something solid is over the player (a cave, a tunnel, a roof) the
//    view becomes a cutaway: around the player every block above its head is
//    left out of what the browser draws, so the player stays visible from
//    above like in a plan. (A camera inside rock shows only see-through block
//    insides; an eye view underground shows only the wall in front.)
// Replaces prismarine-viewer's mineflayer() server.
//   require('./viewer')(bot, { port: 3007, name: 'alpha' })

const { WorldView } = require('prismarine-viewer/viewer')
const { setupRoutes } = require('prismarine-viewer/lib/common')
const { Vec3 } = require('vec3')

const HEIGHT = 14 // camera: blocks above the player
const BACK = 6 // blocks to the south, so the view is tilted, not straight down
const YAW = 0 // camera faces north
const EYE = 1.6 // the viewer adds this to the camera height
const CUT_RADIUS = 2 // chunks around the player that are cut open
const CUT_ABOVE = 2 // keep the blocks up to the player's head; cut from feet+2

const fs = require('fs')
const path = require('path')
let bundle = null
function patchedBundle () {
  if (bundle) return bundle
  const src = fs.readFileSync(path.join(path.dirname(require.resolve('prismarine-viewer/package.json')), 'public', 'index.js'), 'utf8')
  let res = src
  const hook = 'this.scene.add(this.directionalLight);'
  if (res.includes(hook)) res = res.replace(hook, hook + 'window.__pv=this;')
  const socketTarget = 'const{Viewer:r,Entity:a}=i(5988),o=i(8007)({path:window.location.pathname+"socket.io"});'
  if (res.includes(socketTarget)) res = res.replace(socketTarget, socketTarget + 'window.__socket=o;')
  bundle = res
  return bundle
}
const PAGE = `<!doctype html><html><head><meta charset="utf-8"><title>view</title>
<style>
  html,body{height:100%;margin:0;overflow:hidden;background:#000}
  canvas{width:100%;height:100%}
  #cam-btn {
    position: absolute;
    right: 12px;
    top: 10px;
    padding: 6px 14px;
    border-radius: 6px;
    background: rgba(15, 20, 30, 0.85);
    color: #e0e6ed;
    border: 1px solid rgba(255, 255, 255, 0.25);
    font: 600 13px system-ui, -apple-system, sans-serif;
    cursor: pointer;
    z-index: 1000;
    backdrop-filter: blur(4px);
    transition: background 0.15s, transform 0.1s;
    user-select: none;
    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
  }
  #cam-btn:hover { background: rgba(35, 45, 65, 0.95); color: #fff; }
  #cam-btn:active { transform: scale(0.96); }
</style></head>
<body>
<button id="cam-btn" title="Перемкнути камеру (гаряча клавіша: V)">🎥 Вигляд зверху</button>
<script src="index.js?v=20261021"></script>
<script>
let camMode = 'overhead'
function toggleCamera () {
  camMode = (camMode === 'overhead' ? 'firstPerson' : 'overhead')
  const btn = document.getElementById('cam-btn')
  btn.innerText = camMode === 'firstPerson' ? '👁 Від 1-ї особи' : '🎥 Вигляд зверху'
  if (window.__socket) window.__socket.emit('cameraMode', camMode)
}
document.getElementById('cam-btn').addEventListener('click', toggleCamera)
window.addEventListener('keydown', (e) => {
  if (e.key === 'v' || e.key === 'V') toggleCamera()
})

// daylight factor from the Minecraft time: 1 by day, 0 at night, fading at dusk and dawn
function daylight (t) {
  if (t < 12000) return 1
  if (t < 13800) return 1 - (t - 12000) / 1800
  if (t < 22200) return 0
  return (t - 22200) / 1800
}
async function tick () {
  try {
    const { t } = await (await fetch('time')).json()
    const pv = window.__pv
    if (!pv) return
    const f = daylight(t)
    const day = [0.68, 0.85, 0.9], night = [0.03, 0.05, 0.12] // lightblue / night sky
    pv.scene.background.setRGB(...day.map((d, i) => night[i] + (d - night[i]) * f))
    pv.ambientLight.intensity = 0.55 + 0.45 * f
    pv.directionalLight.intensity = 0.25 + 0.35 * f
  } catch (e) {}
}
setInterval(tick, 2000); setTimeout(tick, 1500)
</script></body></html>`

module.exports = (bot, { port, name, viewDistance = 6 }) => {
  const express = require('express')
  const app = express()
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
    next()
  })
  const http = require('http').createServer(app)
  const io = require('socket.io')(http)
  // Day and night: prismarine-viewer always draws full daylight. Serve its
  // page with the Viewer exposed as window.__pv, and a small script that dims
  // the light and darkens the sky from the game time (/time).
  app.get('/time', (req, res) => res.json({ t: bot.time ? bot.time.timeOfDay : 6000 }))
  app.get('/index.js', (req, res) => res.type('application/javascript').send(patchedBundle()))
  app.get('/', (req, res) => res.type('html').send(PAGE))
  setupRoutes(app, '')
  const Chunk = require('prismarine-chunk')(bot.version)

  const views = new Map() // socket -> worldView
  let lastCam = null
  let cutY = null // null: no cutaway
  let cutCenter = null // chunk coords the cut was made around
  let lastResend = 0
  let votes = 0

  const solidAt = (p) => { const bl = bot.blockAt(p.floored()); return bl && bl.boundingBox === 'block' && !/leaves/.test(bl.name) }
  // Anything solid (not tree leaves) between the player's head and the camera?
  function covered () {
    const head = bot.entity.position.offset(0, 1.8, 0)
    const step = new Vec3(0, HEIGHT, BACK).scaled(1 / 40)
    for (let i = 1; i <= 40; i++) if (solidAt(head.plus(step.scaled(i)))) return true
    return false
  }

  const chunkOf = (x, z) => [Math.floor(x / 16), Math.floor(z / 16)]
  const nearCut = (cx, cz) => cutY !== null && cutCenter && Math.abs(cx - cutCenter[0]) <= CUT_RADIUS && Math.abs(cz - cutCenter[1]) <= CUT_RADIUS

  function cutChunk (data) {
    const [cx, cz] = chunkOf(data.x, data.z)
    if (!nearCut(cx, cz)) return data
    const col = Chunk.fromJson(data.chunk)
    const top = (col.minY ?? 0) + (col.worldHeight ?? 256)
    const p = new Vec3(0, 0, 0)
    for (p.x = 0; p.x < 16; p.x++) {
      for (p.z = 0; p.z < 16; p.z++) {
        for (p.y = cutY; p.y < top; p.y++) {
          if (col.getBlockStateId(p) !== 0) col.setBlockStateId(p, 0)
        }
      }
    }
    return { x: data.x, z: data.z, chunk: col.toJson() }
  }

  // Wrap the socket so every chunk and block update goes through the cut.
  function filtered (socket) {
    return {
      on: (...a) => socket.on(...a),
      emit: (ev, data) => {
        if (socket.cameraMode === 'firstPerson') {
          socket.emit(ev, data)
          return
        }
        if (ev === 'loadChunk') data = cutChunk(data)
        else if (ev === 'blockUpdate' && cutY !== null && data.pos.y >= cutY && nearCut(...chunkOf(data.pos.x, data.pos.z))) data = { pos: data.pos, stateId: 0 }
        socket.emit(ev, data)
      }
    }
  }

  // Send the chunks around the player again (after the cut changed).
  function resendNear (center) {
    for (const wv of views.values()) {
      for (let dx = -CUT_RADIUS - 1; dx <= CUT_RADIUS + 1; dx++) {
        for (let dz = -CUT_RADIUS - 1; dz <= CUT_RADIUS + 1; dz++) {
          wv.loadChunk(new Vec3((center[0] + dx) * 16, 0, (center[1] + dz) * 16)).catch(() => {})
        }
      }
    }
  }

  function updateCut () {
    const feet = bot.entity.position
    const want = covered() ? Math.floor(feet.y) + CUT_ABOVE : null
    votes = (want === null) === (cutY === null) ? 0 : votes + 1 // switch on/off after ~0.8 s of agreement
    const center = chunkOf(feet.x, feet.z)
    const old = { y: cutY, center: cutCenter }
    if (votes >= 8) { cutY = want; votes = 0 }
    if (cutY !== null && want !== null && Math.abs(want - cutY) >= 2) cutY = want // went up or down
    if (cutY !== null) cutCenter = center
    const changed = old.y !== cutY || (cutY !== null && (!old.center || old.center[0] !== center[0] || old.center[1] !== center[1]))
    if (changed && Date.now() - lastResend > 1500) {
      lastResend = Date.now()
      resendNear(cutY !== null ? center : (old.center || center))
    }
  }

  function tick () {
    if (!bot.entity || !views.size) return
    updateCut()
    const feet = bot.entity.position
    const cam = feet.offset(0, 1.8 + HEIGHT, BACK)
    lastCam = lastCam && lastCam.distanceTo(cam) < 30 ? lastCam.plus(cam.minus(lastCam).scaled(0.3)) : cam
    const d = feet.offset(0, 1, 0).minus(lastCam)
    const overheadPacket = { pos: lastCam.offset(0, -EYE, 0), yaw: YAW, pitch: Math.atan2(d.y, Math.hypot(d.x, d.z)) }
    const firstPersonPacket = { pos: feet, yaw: bot.entity.yaw, pitch: bot.entity.pitch }
    const self = { id: `self-${name}`, name: 'player', username: name, pos: feet, width: 0.6, height: 1.8, yaw: bot.entity.yaw, pitch: 0 }
    for (const socket of views.keys()) {
      if (socket.cameraMode === 'firstPerson') {
        socket.emit('entity', { id: `self-${name}`, delete: true })
        socket.emit('position', firstPersonPacket)
      } else {
        socket.emit('entity', self)
        socket.emit('position', overheadPacket)
      }
    }
  }
  const timer = setInterval(tick, 100)

  io.on('connection', (socket) => {
    socket.cameraMode = 'overhead'
    socket.on('cameraMode', (m) => {
      if (m === 'firstPerson' || m === 'overhead') {
        socket.cameraMode = m
        if (bot.entity) {
          const center = chunkOf(bot.entity.position.x, bot.entity.position.z)
          resendNear(center)
        }
      }
    })
    socket.emit('version', bot.version)
    const worldView = new WorldView(bot.world, viewDistance, bot.entity.position, filtered(socket))
    views.set(socket, worldView)
    worldView.init(bot.entity.position)
    const follow = () => {
      if (worldView.world !== bot.world) {
        worldView.world = bot.world
        worldView.loadedChunks = {}
        socket.emit('version', bot.version)
        worldView.init(bot.entity.position)
        return
      }
      worldView.updatePosition(bot.entity.position)
    }
    const onRespawn = () => {
      setTimeout(() => {
        if (!bot.entity) return
        worldView.world = bot.world
        worldView.loadedChunks = {}
        lastCam = null
        cutY = null
        cutCenter = null
        socket.emit('version', bot.version)
        worldView.init(bot.entity.position)
      }, 500)
    }
    bot.on('move', follow)
    bot.on('respawn', onRespawn)
    worldView.listenToBot(bot)
    socket.on('disconnect', () => {
      bot.removeListener('move', follow)
      bot.removeListener('respawn', onRespawn)
      worldView.removeListenersFromBot(bot)
      views.delete(socket)
    })
  })

  http.listen(port, '127.0.0.1', () => console.log(`[${name}] overhead viewer on :${port}`))

  bot.viewer = {
    close () {
      clearInterval(timer)
      for (const s of views.keys()) s.disconnect()
      http.close()
    }
  }
}
