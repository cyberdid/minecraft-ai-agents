// 061-deep-scan.js - scan at y=-39 for diamonds, iron, and lava; block hostiles, craft table and stone pickaxe
console.log('Position at depth:', lib.fmt(bot.entity.position))

// 1. Block off line of sight/approach if hostile mob near
const hostiles = lib.hostiles(16)
console.log('Nearby hostiles:', JSON.stringify(hostiles))

// 2. Scan for ores
const diamonds = lib.find(['diamond_ore', 'deepslate_diamond_ore'], { maxDistance: 32, count: 10 })
console.log(`Diamond ores found within 32 blocks:`, diamonds.length, diamonds.map(d => `${d.name} at ${lib.fmt(d.position)}`))

const ironOres = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 16, count: 10 })
console.log(`Iron ores found within 16 blocks:`, ironOres.length, ironOres.map(i => `${i.name} at ${lib.fmt(i.position)}`))

const lava = lib.find('lava', { maxDistance: 32, count: 10 })
console.log(`Lava sources found within 32 blocks:`, lava.length, lava.map(l => lib.fmt(l.position)))

// 3. Craft planks, crafting table, and stone pickaxe from cobbled_deepslate / cobblestone
if (lib.count('birch_log') > 0 && lib.count('*_planks') < 4) {
  await lib.craft('birch_planks', 8)
}
if (lib.count('crafting_table') === 0 && lib.count('*_planks') >= 4) {
  await lib.craft('crafting_table', 1)
}
if (lib.count('stick') < 4 && lib.count('*_planks') >= 2) {
  await lib.craft('stick', 4)
}
if (lib.count('stone_pickaxe') === 0) {
  await lib.craft('stone_pickaxe', 2)
  console.log('Crafted 2 spare stone pickaxes!')
}

// 4. If deepslate iron is near, mine 3 to make an iron pickaxe
if (ironOres.length > 0 && lib.count('raw_iron') < 3) {
  for (const ore of ironOres) {
    if (lib.count('raw_iron') >= 3) break
    console.log(`Mining iron at ${lib.fmt(ore.position)}...`)
    try {
      await lib.dig(ore.position.x, ore.position.y, ore.position.z)
    } catch (e) {}
  }
  await lib.pickup(6)
}

console.log('Raw iron in inventory:', lib.count('raw_iron'))
console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Tools:', JSON.stringify(lib.tools()))

return { diamonds, ironOres, lava, inv: lib.inv(), pos: bot.entity.position }
