// programs/637-inspect-portal-and-gravel.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 637: INSPECT NETHER PORTAL FRAME & GRAVEL ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Maintain golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

// 2. Scan nearby teammates
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e !== bot.entity);
console.log(`Players nearby (${players.length}):`);
for (const p of players) {
  console.log(`- ${p.username} at ${lib.fmt(p.position)}, dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}

// 3. Inspect Nether Portal Frame around (46, 66, 2)
const obsidians = bot.findBlocks({
  matching: b => b && b.name === 'obsidian',
  maxDistance: 16,
  count: 30
});
console.log(`Found ${obsidians.length} obsidian blocks near portal:`);
for (const ob of obsidians) {
  console.log(`  obsidian at ${lib.fmt(ob)}`);
}

const portalBlocks = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 16,
  count: 10
});
console.log(`Active nether_portal blocks: ${portalBlocks.length}`);

// 4. Scan for gravel within 24m
const gravels = bot.findBlocks({
  matching: b => b && b.name === 'gravel',
  maxDistance: 24,
  count: 30
});
console.log(`Found ${gravels.length} gravel blocks nearby:`);
for (let i = 0; i < Math.min(5, gravels.length); i++) {
  console.log(`  gravel at ${lib.fmt(gravels[i])}`);
}

// 5. Check if we already have flint or flint_and_steel
console.log('Current Inventory:', lib.inv());
console.log(`Flint: ${lib.count('flint')}, Iron ingots: ${lib.count('iron_ingot')}, Flint & Steel: ${lib.count('flint_and_steel')}`);

// 6. If gravel exists and we don't have flint:
if (lib.count('flint') === 0 && lib.count('flint_and_steel') === 0 && gravels.length > 0) {
  bot.chat('gamma: Mining nearby gravel to obtain flint for flint_and_steel to reignite portal!');
  const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
  if (pick) await bot.equip(pick, 'hand');

  for (let g = 0; g < gravels.length && lib.count('flint') === 0 && !isCancelled(); g++) {
    const gp = gravels[g];
    const b = bot.blockAt(gp);
    if (!b || b.name !== 'gravel') continue;
    
    try {
      await bot.pathfinder.goto(new goals.GoalNear(gp.x, gp.y, gp.z, 2.5));
      await bot.dig(b);
      await sleep(300);
      await lib.pickup(4.0);
    } catch (e) {}
  }
}

// 7. If flint is obtained and we have iron_ingot, craft flint_and_steel!
if (lib.count('flint') > 0 && lib.count('iron_ingot') > 0 && lib.count('flint_and_steel') === 0) {
  console.log('Crafting flint_and_steel in 2x2 grid...');
  try {
    await lib.craft('flint_and_steel', 1);
    bot.chat('gamma: Successfully crafted flint_and_steel! Reigniting Nether Portal at (46, 66, 2)!');
  } catch (err) {
    console.log('Craft error:', err.message);
  }
}

// 8. If flint_and_steel is in inventory and portal is unlit:
if (lib.count('flint_and_steel') > 0 && portalBlocks.length === 0) {
  const fns = bot.inventory.items().find(i => i.name === 'flint_and_steel');
  if (fns) {
    await bot.equip(fns, 'hand');
    // Find obsidian bottom sill (y=66 at z=2)
    const sill = obsidians.find(o => o.y === 66 && o.z === 2);
    const targetSill = sill || new Vec3(46, 66, 2);
    console.log('Igniting portal sill at:', lib.fmt(targetSill));
    await bot.pathfinder.goto(new goals.GoalNear(targetSill.x, targetSill.y + 1, targetSill.z, 2.0));
    await bot.activateBlock(bot.blockAt(targetSill), new Vec3(0, 1, 0));
    await sleep(1000);
    
    const newPortals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
    console.log(`Portals active after ignition: ${newPortals.length}`);
    if (newPortals.length > 0) {
      bot.chat('gamma: Nether return portal at (46, 66, 2) is 100% RELIT AND OPERATIONAL!');
    }
  }
}

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  flint: lib.count('flint'),
  fns: lib.count('flint_and_steel'),
  gravels: gravels.length,
  obsidians: obsidians.length,
  portals: bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 12 }).length
};
