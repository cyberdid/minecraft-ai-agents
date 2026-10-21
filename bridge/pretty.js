// Turns `agy --output-format stream-json` into a readable live view.
//   agy ... --output-format stream-json | node pretty.js <name> <usage.jsonl>
// Prints the agent's messages, its ./mc runs (with the first lines of output)
// and file writes; appends token usage per turn to <usage.jsonl>.

const fs = require('fs')
const readline = require('readline')

const NAME = process.argv[2] || 'agent'
const USAGE_FILE = process.argv[3]
const C = { dim: '\x1b[2m', cyan: '\x1b[36m', yellow: '\x1b[33m', red: '\x1b[31m', green: '\x1b[32m', bold: '\x1b[1m', off: '\x1b[0m' }
const ts = () => new Date().toTimeString().slice(0, 8)
const text = {}

const rl = readline.createInterface({ input: process.stdin })
rl.on('line', (line) => {
  let ev
  try { ev = JSON.parse(line) } catch { return }
  if (ev.event === 'init') {
    console.log(`${C.dim}${ts()} [${NAME}] conversation ${ev.conversation_id} · ${ev.init?.model}${C.off}`)
    return
  }
  if (ev.event === 'result') {
    const r = ev.result || {}
    const u = r.usage || {}
    console.log(`${C.dim}${ts()} turn ${r.status} · ${Math.round(r.duration_seconds || 0)}s · in ${u.input_tokens} (cached ${u.cache_read_tokens}) out ${u.output_tokens} think ${u.thinking_tokens}${C.off}`)
    if (USAGE_FILE) fs.appendFileSync(USAGE_FILE, JSON.stringify({ t: new Date().toISOString(), ...r, response: undefined }) + '\n')
    return
  }
  const s = ev.step_update
  if (!s) return
  if (s.step_type === 'agent_response') {
    if (s.text_delta) text[s.step_index] = (text[s.step_index] || '') + s.text_delta
    if (s.state === 'DONE' && text[s.step_index]?.trim()) {
      console.log(`${C.cyan}${ts()} 💬 ${text[s.step_index].trim()}${C.off}`)
      delete text[s.step_index]
    }
    return
  }
  if (s.step_type === 'tool' && s.state === 'DONE') {
    const info = s.tool_info || {}
    const p = info.parameters || {}
    if (s.tool_name === 'run_command') {
      const out = String(info.output || '').replace(/^Command exited with code \d+\.\s*Command output:\s*/s, '')
      const lines = out.split('\n').filter((l) => l.trim())
      const failed = /--- ERROR ---|BRIDGE ERROR|exited with code [1-9]/.test(String(info.output))
      console.log(`${failed ? C.red : C.yellow}${ts()} $ ${String(p.CommandLine || '').slice(0, 160)}${C.off}`)
      const keep = lines.filter((l) => !/^\s+at /.test(l)).slice(0, 8)
      for (const l of keep) console.log(`${C.dim}    ${l.slice(0, 180)}${C.off}`)
    } else if (/write_to_file|replace_file_content|multi_replace_file_content|sed_file/.test(s.tool_name)) {
      console.log(`${C.green}${ts()} ✎ ${s.tool_name} ${p.TargetFile || p.AbsolutePath || p.File || ''}${C.off}`)
    } else if (s.tool_name === 'view_file') {
      console.log(`${C.dim}${ts()} 👁  ${p.AbsolutePath || p.File || ''}${C.off}`)
    } else {
      console.log(`${C.dim}${ts()} · ${s.tool_name}${C.off}`)
    }
  }
})
