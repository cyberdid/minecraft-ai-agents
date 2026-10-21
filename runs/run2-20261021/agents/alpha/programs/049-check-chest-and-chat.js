// programs/049-check-chest-and-chat.js
bot.chat("beta: House is at 67/89 blocks! Only 22 sandstone left. Do you have sandstone or scaffold dirt?")

// Check chest
try {
  const chest = await lib.chestContents(9, 67, -23)
  console.log('Chest contents:', JSON.stringify(chest))
  if (chest.sandstone) {
    console.log(`Withdrawing ${chest.sandstone} sandstone...`)
    await lib.withdraw({ sandstone: 'all' }, 9, 67, -23)
  }
  if (chest.dirt || chest.cobblestone) {
    await lib.withdraw({ dirt: 'all', cobblestone: 'all' }, 9, 67, -23)
  }
} catch (e) {
  console.log('chest err:', e.message)
}

// Check nearby drops
const picked = await lib.pickup(8)
console.log('Picked up:', picked)

console.log('Alpha inventory:', JSON.stringify(lib.inv()))

const beta = bot.players.beta?.entity
console.log('Beta pos:', beta ? lib.fmt(beta.position) : 'unknown')

return lib.status()
