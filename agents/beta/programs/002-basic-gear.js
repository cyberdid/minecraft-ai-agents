// 002-basic-gear.js - gather wood, stone, make basic stone tools, furnace, chest, dirt
console.log('Starting basic gear gathering. Time:', lib.time())

// 1. Collect 8 logs
console.log('Collecting logs...')
const logs = await lib.collect('*_log', 8)
console.log('Logs collected:', JSON.stringify(logs))

// 2. Craft planks
const logName = Object.keys(logs).find(k => k.endsWith('_log')) || 'oak_log'
const plankName = logName.replace('_log', '_planks')
await lib.craft(plankName, 24)
console.log('Planks now:', lib.count(plankName))

// 3. Craft crafting table and sticks
await lib.craft('crafting_table', 1)
await lib.craft('stick', 8)

// 4. Wooden pickaxe
await lib.craft('wooden_pickaxe', 1)

// 5. Cobblestone
console.log('Collecting stone...')
await lib.collect('stone', 16)
console.log('Cobblestone now:', lib.count('cobblestone'))

// 6. Stone tools
await lib.craft('stone_pickaxe', 1)
await lib.craft('stone_sword', 1)
await lib.craft('stone_axe', 1)
await lib.craft('furnace', 1)
await lib.craft('chest', 1)

// 7. Dirt for safety
console.log('Collecting dirt...')
await lib.collect('dirt', 16)
console.log('Dirt now:', lib.count('dirt'))

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time left until night:', lib.time().secondsUntilNight)
return lib.inv()
