// programs/065-pickup-items.js
console.log('Walking to (367, -38, -30) to pick up dropped items...')
await lib.goTo(367, -38, -30, 1, { dig: true })
await lib.pickup(6)
console.log('Inventory now:', JSON.stringify(lib.inv()))

const planks = lib.count('*_planks')
console.log('Planks now:', planks)
console.log('Sticks now:', lib.count('stick'))

if (planks > 0 && lib.count('stick') < 2) {
  await lib.craft('stick', 4)
  console.log('Crafted sticks! Sticks now:', lib.count('stick'))
}

if (lib.count('stick') >= 2 && lib.count('diamond') >= 3) {
  await lib.ensureTable()
  console.log('Crafting DIAMOND_PICKAXE...')
  await lib.craft('diamond_pickaxe', 1)
  console.log('DIAMOND PICKAXE CRAFTED!')
  bot.chat('beta: Milestone 6 achieved! DIAMOND PICKAXE crafted!')
}

return {
  diamond_pickaxe: lib.count('diamond_pickaxe'),
  diamonds: lib.count('diamond'),
  sticks: lib.count('stick'),
  planks: lib.count('*_planks')
}
