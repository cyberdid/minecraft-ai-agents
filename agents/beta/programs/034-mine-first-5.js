// Mine first 5 obsidian blocks that have solid deepslate underneath
const safeObs = [
  new Vec3(349, -55, -29),
  new Vec3(348, -55, -31),
  new Vec3(348, -55, -32),
  new Vec3(347, -55, -32),
  new Vec3(346, -55, -32)
]

for (const p of safeObs) {
  if (lib.count('obsidian') >= 10) break
  console.log(`Mining obsidian at ${p}...`)
  await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand')
  await lib.goTo(p.x, p.y + 1, p.z, 3).catch(() => {})
  await lib.dig(p.x, p.y, p.z)
  await lib.pickup(4)
  console.log(`Mined ${p}. Obsidian count now:`, lib.count('obsidian'))
}
return { obsidian: lib.count('obsidian') }
