// programs/829-ascend-and-quench-portal.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 829: Ascend with Water Bucket & Quench Portal ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Equip pickaxe for movement
const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Configure movement
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

// Step 1: Ascend staircase from y=47 to surface portal area at (297, 72, -54)
const ascendWaypoints = [
  new Vec3(291, 55, -55),
  new Vec3(293, 63, -55),
  new Vec3(294, 72, -54),
  new Vec3(297, 72, -54)
];

for (let i = 0; i < ascendWaypoints.length && !isCancelled(); i++) {
  const wp = ascendWaypoints[i];
  if (bot.entity.position.distanceTo(wp) < 2.0) continue;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.2));
  } catch (e) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 1.5, { dig: true, timeoutMs: 6000 }); } catch (e2) {}
  }
}

console.log('Stationed at portal sill! Pos:', lib.fmt(bot.entity.position));
bot.chat('Beta: Stationed at portal frame (297, 72, -54) holding water bucket to quench lava into obsidian!');

// Face portal sill at (299, 72, -54)
await bot.lookAt(new Vec3(299.5, 72.5, -54.0), true);

// Monitor sill block for 40s
const monitorStart = Date.now();
while (Date.now() - monitorStart < 40000 && !isCancelled()) {
  const sill = bot.blockAt(new Vec3(299, 72, -54));
  const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });

  if (portals.length > 0) {
    console.log(`PORTAL IS RELIT! ${portals.length} active portal blocks detected!`);
    bot.chat(`Beta: PORTAL IS RELIT! ${portals.length} portal blocks active! Warping in!`);
    break;
  }

  // If lava block is placed at (299, 72, -54), quench it immediately!
  if (sill && sill.name === 'lava' && sill.metadata === 0) {
    console.log('LAVA DETECTED AT SILL! Quenching into obsidian with water bucket...');
    const wb = bot.inventory.items().find(i => i.name === 'water_bucket');
    if (wb) {
      await bot.equip(wb, 'hand');
      await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
      bot.activateItem();
      await sleep(1200);
      const bucket = bot.inventory.items().find(i => i.name === 'bucket');
      if (bucket) {
        await bot.equip(bucket, 'hand');
        bot.activateItem();
        await sleep(500);
      }
      bot.chat('Beta: Quenched lava into obsidian! Sill repaired!');
    }
  }

  await sleep(1000);
}

// Final check
const finalSill = bot.blockAt(new Vec3(299, 72, -54));
const finalPortals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });

console.log('=== Program 829 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Sill block:', finalSill ? finalSill.name : 'null');
console.log('Active portal blocks:', finalPortals.length);

return {
  sill_block: finalSill ? finalSill.name : 'null',
  portal_active: finalPortals.length > 0,
  water_bucket: lib.count('water_bucket')
};
