console.log('=== Smelting with lib.smelt & Crafting Iron Pickaxe ===')

// 1. Smelt 3 raw iron using lib.smelt
console.log('Calling lib.smelt("raw_iron", "birch_planks", 3)...')
const smeltRes = await lib.smelt('raw_iron', 'birch_planks', 3)
console.log('Smelt result:', JSON.stringify(smeltRes))
console.log('Iron ingots on beta:', lib.count('iron_ingot'))

// 2. Craft iron_pickaxe
if (lib.count('iron_ingot') >= 3) {
  console.log('Crafting iron_pickaxe...')
  await lib.craft('iron_pickaxe', 1)
  console.log('Crafted iron_pickaxe!')
  bot.chat('Milestone 2 update: Beta crafted iron_pickaxe! All iron tools ready.')
}

console.log('Final tools:', JSON.stringify(lib.tools()))
console.log('Beta inv:', JSON.stringify(lib.inv()))
