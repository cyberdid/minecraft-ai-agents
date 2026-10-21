console.log('--- Step 1: Collect more wood ---')
const treeLogs = await lib.collect('*_log', 4)
console.log('Got logs:', JSON.stringify(treeLogs))

console.log('--- Step 2: Craft backup wooden pickaxe & planks ---')
await lib.craft('dark_oak_planks', 8)
if (lib.count('stick') < 2) {
  await lib.craft('stick', 4)
}
await lib.craft('wooden_pickaxe', 1)
console.log('Inventory before descend:', JSON.stringify(lib.inv()))

console.log('--- Step 3: Descend to y=51 for stone ---')
const descRes = await lib.descend(51)
console.log('Descend result:', descRes)
console.log('Position after descend:', lib.fmt(bot.entity.position))

console.log('--- Step 4: Collect stone/cobblestone ---')
const cobble = await lib.collect(['stone', 'cobblestone'], 16)
console.log('Got cobble:', JSON.stringify(cobble))

console.log('--- Step 5: Craft stone pickaxe and furnace ---')
await lib.craft('stone_pickaxe', 1)
await lib.craft('furnace', 1)
console.log('Tools now:', JSON.stringify(lib.tools()))
console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time until night:', lib.time().secondsUntilNight, 's')

bot.chat(`alpha: reached stone at y=51, crafted stone pickaxe & furnace. ${lib.count('cobblestone')} cobble in inv.`)
