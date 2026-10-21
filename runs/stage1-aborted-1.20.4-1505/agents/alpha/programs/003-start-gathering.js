console.log('Obtaining stone tools...')
await lib.obtain('stone_pickaxe', 1)
console.log('stone_pickaxe obtained, inventory:', JSON.stringify(lib.inv()))

await lib.obtain('stone_axe', 1)
console.log('stone_axe obtained, inventory:', JSON.stringify(lib.inv()))

await lib.obtain('stone_sword', 1)
console.log('stone_sword obtained, inventory:', JSON.stringify(lib.inv()))

console.log('Current tools:', JSON.stringify(lib.tools()))
console.log('Time left until night:', lib.time().secondsUntilNight)

bot.chat('alpha: crafted stone tools (pick, axe, sword). Ready to gather building materials or help build.')

return { inv: lib.inv(), time: lib.time() }
