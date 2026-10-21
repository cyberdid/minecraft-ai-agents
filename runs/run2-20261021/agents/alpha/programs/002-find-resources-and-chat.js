// programs/002-find-resources-and-chat.js
bot.chat("beta: Let's build a 5x5 house near (15, 67, -15). I can gather wood & craft tools, can you gather cobblestone & coal?")

const logs64 = lib.find('*_log', { maxDistance: 64, count: 5 })
console.log('logs within 64m:', logs64.length)
if (logs64.length > 0) {
  console.log('nearest log at:', lib.fmt(logs64[0].position))
} else {
  const logs128 = lib.find('*_log', { maxDistance: 128, count: 5 })
  console.log('logs within 128m:', logs128.length)
  if (logs128.length > 0) {
    console.log('nearest log (128m) at:', lib.fmt(logs128[0].position))
  }
}

// Check nearby animals
const animals = ['cow', 'pig', 'sheep', 'chicken']
for (const a of animals) {
  const count = Object.values(bot.entities).filter(e => e.name === a).length
  if (count > 0) console.log(`nearby ${a}:`, count)
}

return { logs64: logs64.length }
