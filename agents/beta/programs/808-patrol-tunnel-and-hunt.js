// programs/808-patrol-tunnel-and-hunt.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 808: Patrol Covered Tunnel, Hunt Endermen & Scout Piglins ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    try { await bot.equip(gb, 'feet'); } catch (e) {}
  }
}
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(sh, 'off-hand'); } catch (e) {}
}
const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
if (sw) {
  try { await bot.equip(sw, 'hand'); } catch (e) {}
}

// Keep shield active by default
bot.activateItem(true);

// Patrol points along safe covered corridor from z=-144 towards z=-169
const patrolWps = [
  new Vec3(44.5, 65.0, -150.0),
  new Vec3(44.5, 65.0, -160.0),
  new Vec3(44.5, 65.0, -168.0) // Blast wall
];

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

for (let i = 0; i < patrolWps.length && !isCancelled(); i++) {
  const wp = patrolWps[i];
  console.log(`Patrolling to WP ${i + 1}/${patrolWps.length}: ${lib.fmt(wp)}`);

  // Verify floor underfoot
  const floor = bot.blockAt(new Vec3(wp.x, 64, wp.z));
  if (!floor || floor.boundingBox !== 'block') {
    console.log(`Warning: Missing floor at (${wp.x}, 64, ${wp.z})! Placing cobble floor...`);
    const cob = bot.inventory.items().find(it => it.name === 'cobblestone' || it.name === 'netherrack');
    if (cob) {
      try {
        await bot.equip(cob, 'hand');
        const ref = bot.blockAt(new Vec3(wp.x, 63, wp.z)) || bot.blockAt(new Vec3(wp.x, 64, wp.z + 1));
        if (ref) await bot.placeBlock(ref, new Vec3(0, 1, 0));
      } catch (e) {}
    }
  }

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.2));
  } catch (e) {
    console.log(`Pathfinder step ${i + 1} retry:`, e.message);
    try { await lib.goTo(wp.x, wp.y, wp.z, 1.8, { timeoutMs: 6000 }); } catch (e2) {}
  }

  // Vacuum any dropped items
  await lib.pickup(4.0);

  // Check for nearby Piglins
  const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && bot.entity.position.distanceTo(e.position) <= 16);
  if (piglins.length > 0) {
    console.log(`Piglins detected at WP ${i + 1} (${piglins.length}):`, piglins.map(p => `${lib.fmt(p.position)} dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}`).join(', '));
    bot.chat(`Beta: Neutral Piglin scouted at ${lib.fmt(piglins[0].position)}! Ready for bartering!`);
  }

  // Check for nearby Endermen
  const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman' && bot.entity.position.distanceTo(e.position) <= 28);
  if (endermen.length > 0) {
    const target = endermen[0];
    console.log(`Enderman spotted at ${lib.fmt(target.position)}! Initiating safe 2-high hunt from under roof at y=67...`);
    bot.chat(`Beta: Slaying Enderman at ${lib.fmt(target.position)} from under covered tunnel ceiling for Ender Pearl!`);

    // Look at Enderman head to aggro
    await bot.lookAt(target.position.offset(0, 2.7, 0), true);
    await sleep(1500);

    const sword = bot.inventory.items().find(it => it.name === 'iron_sword');
    if (sword) await bot.equip(sword, 'hand');

    // Fight loop: stay stationary under the 2-high ceiling
    const attackStart = Date.now();
    let hits = 0;
    while (Date.now() - attackStart < 12000 && !isCancelled()) {
      const live = bot.entities[target.id];
      if (!live || !live.isValid || live.health <= 0) {
        console.log('Enderman defeated!');
        break;
      }
      const dist = bot.entity.position.distanceTo(live.position);
      if (dist <= 4.0) {
        bot.deactivateItem();
        bot.attack(live);
        hits++;
        await sleep(650);
        bot.activateItem(true);
      }
      await sleep(100);
    }
    await lib.pickup(5.0);

    const pearls = lib.count('ender_pearl');
    if (pearls > 0) {
      bot.chat(`Beta: Ender Pearl HARVESTED! Total: ${pearls}/12! Milestone 9 progressing!`);
    }
  }

  if (bot.health <= 7) {
    console.log(`HP low (${bot.health}), retreating slightly in cover.`);
    break;
  }
}

console.log('=== Program 808 Summary ===');
console.log('Final Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Ender Pearls in inv:', lib.count('ender_pearl'));
console.log('Gold ingots in inv:', lib.count('gold_ingot'));
console.log('Gold nuggets in inv:', lib.count('gold_nugget'));
console.log('Blaze rods in inv:', lib.count('blaze_rod'));
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  ender_pearls: lib.count('ender_pearl'),
  gold_ingots: lib.count('gold_ingot'),
  gold_nuggets: lib.count('gold_nugget'),
  inv: lib.inv()
};
