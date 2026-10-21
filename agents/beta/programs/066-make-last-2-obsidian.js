// Make last 2 obsidian using lib.makeObsidian
console.log('Obsidian before:', lib.count('obsidian'))
bot.chat('beta: casting last 2 obsidian at y=-55')
const result = await lib.makeObsidian(10)
console.log('Result:', JSON.stringify(result))
console.log('Final obsidian count:', lib.count('obsidian'))
return { obsidian: lib.count('obsidian') }
