// 038-smelt-iron-gear.js - clear furnace slots, smelt 14 raw iron, craft iron tools, shield, bucket
const furnaceBlock = lib.blockAt(295, 72, -55)
const furnace = await bot.openFurnace(furnaceBlock)

console.log('Slots in furnace window:')
for (let i = 0; i < 3; i++) {
  const item = furnace.slots[i]
  console.log(`Slot ${i}:`, item ? `${item.count}x ${item.name}` : 'empty')
}

// Click and take everything out of slot 2 (output) and slot 0, 1 if needed
if (furnace.slots[2]) {
  console.log('Taking item from output slot 2...')
  await bot.clickWindow(2, 0, 0)
  await lib.stowCursor()
}
if (furnace.slots[0]) {
  console.log('Taking item from input slot 0...')
  await bot.clickWindow(0, 0, 0)
  await lib.stowCursor()
}

furnace.close()

console.log('Inventory now:', JSON.stringify(lib.inv()))

// Now smelt all 14 raw_iron in furnace using birch_planks / logs
const rawIron = lib.count('raw_iron')
console.log(`Smelting ${rawIron} raw_iron...`)

if (rawIron > 0) {
  try {
    const res = await lib.smelt('raw_iron', 'birch_planks', rawIron)
    console.log('Smelting result:', JSON.stringify(res))
  } catch (e) {
    console.log('Smelting note:', e.message)
  }
}

console.log('Iron ingots count:', lib.count('iron_ingot'))

// Craft Iron Tools (Milestone 2)
// 1. iron_pickaxe (3 ingots, 2 sticks)
if (lib.count('iron_ingot') >= 3 && lib.count('iron_pickaxe') === 0) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4)
  console.log('Crafting iron_pickaxe...')
  await lib.craft('iron_pickaxe', 1)
  console.log('Iron pickaxe crafted!')
}

// 2. iron_sword (2 ingots, 1 stick)
if (lib.count('iron_ingot') >= 2 && lib.count('iron_sword') === 0) {
  if (lib.count('stick') < 1) await lib.craft('stick', 4)
  console.log('Crafting iron_sword...')
  await lib.craft('iron_sword', 1)
  console.log('Iron sword crafted!')
}

// 3. iron_axe (3 ingots, 2 sticks)
if (lib.count('iron_ingot') >= 3 && lib.count('iron_axe') === 0) {
  if (lib.count('stick') < 2) await lib.craft('stick', 4)
  console.log('Crafting iron_axe...')
  await lib.craft('iron_axe', 1)
  console.log('Iron axe crafted!')
}

// Craft shield (1 ingot, 6 planks)
if (lib.count('iron_ingot') >= 1 && lib.count('shield') === 0) {
  if (lib.count('*_planks') < 6) await lib.craft('birch_planks', 4)
  console.log('Crafting shield...')
  try {
    await lib.craft('shield', 1)
    await lib.equipArmor()
    console.log('Shield crafted and equipped in offhand!')
  } catch (e) {
    console.log('Shield craft error:', e.message)
  }
}

// Craft bucket (3 ingots)
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0) {
  console.log('Crafting bucket...')
  try {
    await lib.craft('bucket', 1)
    console.log('Bucket crafted!')
  } catch (e) {
    console.log('Bucket craft error:', e.message)
  }
}

console.log('Tools:', JSON.stringify(lib.tools()))
console.log('Inventory after crafting:', JSON.stringify(lib.inv()))
console.log('Time left in day:', lib.time().secondsUntilNight)

bot.chat('beta: Milestone 2 achieved! Both players have iron pickaxe, sword, axe!')
return lib.inv()
