// programs/003-find-stone.js
const p = bot.entity.position
console.log('Position:', lib.fmt(p))

// check columns under feet
for (let dy = 0; dy >= -10; dy--) {
  const b = bot.blockAt(p.offset(0, dy, 0))
  console.log(`y=${Math.floor(p.y + dy)}: ${b ? b.name : 'null'}`)
}

const stones = lib.find('stone', { maxDistance: 64, count: 10 })
console.log('Found stone count:', stones.length)
if (stones.length) {
  console.log('Nearest stone:', stones.map(s => `${s.name} at ${lib.fmt(s.position)}`).slice(0, 5))
}

const cobble = lib.find('cobblestone', { maxDistance: 64, count: 10 })
console.log('Found cobble count:', cobble.length)

return { stones: stones.length, cobble: cobble.length }
