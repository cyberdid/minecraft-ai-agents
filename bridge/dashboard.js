// Live view of the run: only the game, one chase-camera view per bot.
// Everything else (programs, chat, events, agent turns) is in logs/, not here.
//   node dashboard.js --port 3100 --bots alpha:3101:3007,beta:3102:3008

const http = require('http')

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), [])
)
const PORT = Number(args.port || 3100)
const BOTS = (args.bots || 'alpha:3101:3007,beta:3102:3008,gamma:3103:3009,delta:3104:3010').split(',').map((s) => {
  const [name, api, viewer] = s.split(':')
  return { name, api: Number(api), viewer: Number(viewer) }
})

const cols = BOTS.length >= 4 ? 2 : BOTS.length
const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Agent View</title>
<style>
  :root { --bg:#000; --label:rgba(0,0,0,.55); --text:#fff }
  * { box-sizing:border-box } html, body { margin:0; height:100%; background:var(--bg); overflow:hidden }
  main { display:grid; grid-template-columns:repeat(${cols}, 1fr); grid-auto-rows:1fr; gap:2px; height:100vh }
  .view { position:relative; min-width:0; background:#000 }
  iframe { position:absolute; inset:0; width:100%; height:100%; border:0 }
  .name { position:absolute; left:10px; top:8px; padding:2px 8px; border-radius:4px; background:var(--label); color:var(--text);
          font:600 14px/1.5 ui-monospace,Menlo,Consolas,monospace; pointer-events:none }
  .away { position:absolute; inset:0; display:none; align-items:center; justify-content:center; color:#aaa; font:14px ui-monospace,monospace }
  @media (max-width:800px) { main { grid-template-columns:1fr; grid-auto-rows:1fr } }
</style></head><body>
<main id="views"></main>
<script>
const BOTS = ${JSON.stringify(BOTS)}
const root = document.getElementById('views')
const state = {}
for (const b of BOTS) {
  root.insertAdjacentHTML('beforeend', \`<section class="view"><iframe id="\${b.name}-f" title="\${b.name}"></iframe>
    <div class="away" id="\${b.name}-away">\${b.name} is logged out (idle) — the view comes back by itself</div>
    <div class="name">\${b.name}</div></section>\`)
  state[b.name] = 'unknown'
}
// (Re)load a view whenever its bot (re)appears in the world: parking and
// reconnects restart the viewer.
async function tick () {
  for (const b of BOTS) {
    let online = false
    try { online = !!(await (await fetch(\`http://\${location.hostname}:\${b.api}/status\`)).json()).online } catch {}
    if (online !== (state[b.name] === 'online')) {
      state[b.name] = online ? 'online' : 'away'
      const f = document.getElementById(b.name + '-f')
      document.getElementById(b.name + '-away').style.display = online ? 'none' : 'flex'
      if (online) setTimeout(() => { f.src = \`http://\${location.hostname}:\${b.viewer}/?t=\${Date.now()}\` }, 1500)
      else f.removeAttribute('src')
    }
  }
}
tick(); setInterval(tick, 3000)
</script></body></html>`

http.createServer((req, res) => { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(page) })
  .listen(PORT, '127.0.0.1', () => console.log(`dashboard on http://localhost:${PORT}`))
