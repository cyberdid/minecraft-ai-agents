// Make 10 obsidian from the lava pool
bot.chat('beta: mining 10 obsidian at y=-55; be careful on surface skeleton near east hill')
const before = lib.count('obsidian')
console.log('Obsidian before:', before)
const result = await lib.makeObsidian(10)
console.log('Result:', JSON.stringify(result))
console.log('Obsidian now:', lib.count('obsidian'))
console.log('Water bucket count:', lib.count('water_bucket'))
return { obsidian: lib.count('obsidian'), result }
