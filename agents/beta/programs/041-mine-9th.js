// Mine the obsidian block at (348, -55, -29)
const target = new Vec3(348, -55, -29)
console.log('Navigating to', target)
await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
await lib.goTo(target.x, target.y + 1, target.z, 3)
console.log('Digging', target)
await lib.dig(target.x, target.y, target.z)
// Place cobblestone under it so drop doesn't fall into lava!
await lib.place('cobblestone', target.x, target.y - 1, target.z).catch(() => {})
await lib.pickup(4)
console.log('Obsidian in inventory:', lib.count('obsidian'))
return { obsidian: lib.count('obsidian') }
