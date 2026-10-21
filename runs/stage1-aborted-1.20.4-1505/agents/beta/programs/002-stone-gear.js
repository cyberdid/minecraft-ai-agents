// programs/002-stone-gear.js
bot.chat('beta: crafting stone pickaxe, axe, sword and gathering dirt.')

const rPick = await lib.obtain('stone_pickaxe', 1)
console.log('stone_pickaxe steps:\n' + rPick.steps.join('\n'))

const rAxe = await lib.obtain('stone_axe', 1)
const rSword = await lib.obtain('stone_sword', 1)

if (lib.count('dirt') < 16) {
  console.log('Collecting dirt for safety...')
  await lib.collect('dirt', 16)
}

const status = lib.status()
bot.chat(`beta: stone gear ready (${lib.count('dirt')} dirt). Time: ${status.timeOfDay} (night in ${status.secondsUntilNight}s)`)

return {
  inv: lib.inv(),
  tools: lib.tools(),
  pos: lib.fmt(status.pos),
  secondsUntilNight: status.secondsUntilNight
}
