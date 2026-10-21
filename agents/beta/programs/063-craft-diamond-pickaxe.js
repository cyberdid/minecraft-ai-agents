// programs/063-craft-diamond-pickaxe.js
// Retrieve fuel planks from furnace, craft sticks, craft diamond_pickaxe (Milestone 6)

console.log('Starting Milestone 6 completion: Crafting Diamond Pickaxe')
console.log('Current position:', lib.fmt(bot.entity.position))
console.log('Diamonds available:', lib.count('diamond'))
console.log('Sticks available:', lib.count('stick'))

// 1. Break the underground furnace to recover the remaining birch planks fuel
const furnaceBlock = lib.find('furnace', { maxDistance: 8 })[0] || lib.blockAt(367, -38, -30)
if (furnaceBlock && furnaceBlock.name === 'furnace') {
  console.log(`Digging furnace at ${lib.fmt(furnaceBlock.position)} to recover fuel...`)
  await lib.dig(furnaceBlock.position.x, furnaceBlock.position.y, furnaceBlock.position.z)
  await lib.pickup(6)
} else {
  // If not found, open window or check ground
  await lib.pickup(6)
}

console.log('Planks now in inventory:', lib.count('*_planks'))
console.log('Sticks before crafting:', lib.count('stick'))

// 2. Craft sticks if needed
if (lib.count('stick') < 2) {
  console.log('Crafting sticks...')
  await lib.craft('stick', 4)
}
console.log('Sticks now:', lib.count('stick'))

// 3. Ensure crafting table is nearby
await lib.ensureTable()

// 4. Craft DIAMOND PICKAXE!
console.log('Crafting diamond_pickaxe from 3 diamonds and 2 sticks...')
await lib.craft('diamond_pickaxe', 1)

// 5. Verification
const diamondPickCount = lib.count('diamond_pickaxe')
console.log('Diamond pickaxe in inventory:', diamondPickCount)
console.log('Remaining diamonds:', lib.count('diamond'))
console.log('Tools:', JSON.stringify(lib.tools()))

if (diamondPickCount > 0) {
  bot.chat('beta: Milestone 6 achieved! DIAMOND PICKAXE crafted!')
  console.log('SUCCESS: Milestone 6 achieved!')
} else {
  throw new Error('Diamond pickaxe not found in inventory!')
}

return {
  diamond_pickaxe: diamondPickCount,
  diamonds: lib.count('diamond'),
  tools: lib.tools()
}
