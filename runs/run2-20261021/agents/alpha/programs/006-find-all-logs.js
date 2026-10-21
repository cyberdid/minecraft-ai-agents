// programs/006-find-all-logs.js
const p = bot.entity.position
const logIds = Object.keys(mcData.blocksByName).filter(k => k.endsWith('_log') || k.endsWith('_planks')).map(k => mcData.blocksByName[k].id)
const blocks = bot.findBlocks({ matching: logIds, maxDistance: 128, count: 50 })
console.log('total wood/planks found within 128m:', blocks.length)
for (const bpos of blocks) {
  const b = bot.blockAt(bpos)
  console.log(`wood ${b?.name} at ${lib.fmt(bpos)} dist=${Math.round(p.distanceTo(bpos))}`)
}

// Also check for dead bush (drops sticks in desert!)
const deadBush = bot.findBlocks({ matching: mcData.blocksByName.dead_bush.id, maxDistance: 32, count: 10 })
console.log('dead bushes:', deadBush.length)

// Also check beta's inventory if possible or what beta is doing
const beta = bot.players.beta
console.log('beta entity:', beta?.entity ? lib.fmt(beta.entity.position) : 'none')
