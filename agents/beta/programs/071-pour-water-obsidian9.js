// Pour water above (349, -55, -30) to make obsidian #9
console.log('Equipping water bucket...')
await bot.equip(mcData.itemsByName.water_bucket.id, 'hand')
await bot.lookAt(new Vec3(349.5, -54.5, -29.8), true)
await sleep(150)
bot.activateItem()
await sleep(2000)

const obsBlock = bot.blockAt(new Vec3(349, -55, -30))
console.log('Block at (349, -55, -30) is now:', obsBlock?.name)

// Extinguish water by placing cobblestone at (349, -54, -30)
console.log('Extinguishing water source...')
await lib.place('cobblestone', 349, -54, -30).catch(e => console.log('Place error:', e.message))
await sleep(1000)

// Mine obsidian at (349, -55, -30)
console.log('Mining obsidian...')
await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
await lib.dig(349, -55, -30)
await lib.pickup(4)
console.log('Obsidian in inventory now:', lib.count('obsidian'))
return { obsidian: lib.count('obsidian') }
