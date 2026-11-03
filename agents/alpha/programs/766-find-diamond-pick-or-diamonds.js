// programs/766-find-diamond-pick-or-diamonds.js
console.log('=== Program 766: Search for Diamond Pickaxe or Diamonds ===');
console.log('Alpha at:', lib.fmt(bot.entity.position));

// 1. Check all containers within 24m
const containers = bot.findBlocks({
  matching: b => b && (b.name.includes('chest') || b.name.includes('barrel')),
  maxDistance: 24,
  count: 10
});

console.log(`Containers found (${containers.length}):`, containers.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));

for (const cp of containers) {
  try {
    const cb = bot.blockAt(cp);
    await bot.pathfinder.goto(new goals.GoalNear(cp.x, cp.y, cp.z, 2.0));
    const win = await bot.openContainer(cb);
    console.log(`Contents of ${cb.name} at ${lib.fmt(cp)}:`);
    for (const it of win.containerItems()) {
      console.log(`  - ${it.name} x${it.count}`);
    }
    win.close();
  } catch (e) {
    console.log(`Error opening container at ${lib.fmt(cp)}:`, e.message);
  }
}

// 2. Check diamond ores within 64m
const diamondOres = bot.findBlocks({
  matching: b => b && (b.name === 'diamond_ore' || b.name === 'deepslate_diamond_ore'),
  maxDistance: 64,
  count: 10
});
console.log(`Diamond ores within 64m (${diamondOres.length}):`, diamondOres.map(p => lib.fmt(p)));

// 3. Check what teammates are holding
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== bot.username) {
    console.log(`Player ${name} held: ${p.entity.heldItem?.name}, equip:`, p.entity.equipment?.map(e => e?.name));
  }
}

return {
  containers: containers.length,
  diamondOres: diamondOres.length
};
