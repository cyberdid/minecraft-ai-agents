console.log('=== Scan Lava Pools for Obsidian ===')

const lavaSources = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 128,
  count: 100
})

console.log(`Found ${lavaSources.length} lava source blocks within 128 blocks:`)
const pools = {}
for (const p of lavaSources) {
  const key = `${Math.floor(p.x/8)*8},${Math.floor(p.z/8)*8}`
  pools[key] = pools[key] || { count: 0, sample: p, y: p.y }
  pools[key].count++
}

for (const [k, data] of Object.entries(pools)) {
  console.log(`Pool near (${k}), y=${data.y}: ${data.count} lava sources (sample: ${lib.fmt(data.sample)})`)
}

const alpha = bot.players.alpha
if (alpha && alpha.entity) {
  console.log(`Alpha at: ${lib.fmt(alpha.entity.position)}`)
}

bot.chat('beta: Diamond pickaxe crafted! Scanning for lava to make 10 obsidian.')
