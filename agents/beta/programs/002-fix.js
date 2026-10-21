// 002-fix.js - recover cursor if any, obtain stone tools, dirt, chat with alpha
await lib.stowCursor()
console.log('Inventory before obtain:', JSON.stringify(lib.inv()))

bot.chat('alpha: I will gather food, wool for beds, and help with base. Base site near (296, 72, -58) sounds great.')

console.log('Obtaining stone_pickaxe...')
const r1 = await lib.obtain('stone_pickaxe', 1)
console.log('Stone pickaxe:', r1.steps.join(' -> '))

console.log('Obtaining stone_sword...')
await lib.obtain('stone_sword', 1)

console.log('Obtaining stone_axe...')
await lib.obtain('stone_axe', 1)

console.log('Collecting dirt for safety...')
if (lib.count('dirt') < 16) {
  await lib.collect('dirt', 16 - lib.count('dirt'))
}

console.log('Inventory after:', JSON.stringify(lib.inv()))
console.log('Time left until night:', lib.time().secondsUntilNight)
