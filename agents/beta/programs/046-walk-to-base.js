// Walk to the base at (294, 72, -54) and check base chest
console.log('Walking to base at (294, 72, -54)...')
bot.chat('beta: arrived at surface with 8 obsidian and diamond pickaxe; heading to base')
await lib.goTo(294, 72, -54, 2)
console.log('At base! Position:', bot.entity.position)

// Check base chest
const chest = await lib.chestContents().catch(e => { console.log('Chest error:', e.message); return {} })
console.log('Base chest contents:', JSON.stringify(chest))

return { pos: bot.entity.position, chest }
