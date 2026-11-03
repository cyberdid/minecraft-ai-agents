// programs/642-march-to-bunker-and-barter.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 642: MARCH TO BUNKER, REUNITE TEAM & BARTER ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

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
const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
if (sw) await bot.equip(sw, 'hand');

// 2. Configure fire avoidance
globalThis.configureFireAvoidance();

// Safe waypoints along East Ridge from (63, 65, -2) to Bunker (44, 65, -131)
const BUNKER_WAYPOINTS = [
  { x: 63.0, y: 65.0, z: -10.0 },
  { x: 63.0, y: 65.0, z: -20.0 },
  { x: 63.0, y: 66.0, z: -35.0 },
  { x: 62.0, y: 67.0, z: -50.0 },
  { x: 61.5, y: 67.0, z: -55.0 },
  { x: 61.5, y: 67.0, z: -60.0 },
  { x: 61.5, y: 67.0, z: -65.0 },
  { x: 61.5, y: 67.0, z: -70.0 },
  { x: 61.5, y: 67.0, z: -75.0 },
  { x: 62.0, y: 67.0, z: -80.0 },
  { x: 61.0, y: 66.0, z: -100.0 },
  { x: 50.0, y: 65.0, z: -115.0 },
  { x: 44.0, y: 65.0, z: -127.0 }, // Bunker entrance
  { x: 44.0, y: 65.0, z: -131.0 }  // Inside bunker
];

bot.chat('gamma: Marching safe East Ridge trail to Fortress Workshop Bunker (44, 65, -131) to join team bartering!');

for (let i = 0; i < BUNKER_WAYPOINTS.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  await globalThis.clearFireAhead();

  const wp = BUNKER_WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 1.8) continue;

  await bot.lookAt(new Vec3(wp.x, 63.5, wp.z));

  if (wp.z <= -20 && wp.z >= -100) {
    bot.activateItem(true);
  } else {
    bot.deactivateItem();
  }

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.2));
  } catch (e) {
    try {
      await globalThis.clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
    } catch (e2) {}
  }

  await globalThis.clearFireAhead();

  if (bot.health <= 7) {
    console.log(`HP low (${bot.health}), pausing march.`);
    break;
  }
}

bot.deactivateItem();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

console.log('Arrived at Bunker area:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 3. Scan teammates at Bunker
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e !== bot.entity);
console.log(`Teammates nearby (${players.length}):`);
for (const p of players) {
  console.log(`- ${p.username} at ${lib.fmt(p.position)}, dist: ${bot.entity.position.distanceTo(p.position).toFixed(1)}m`);
}

// 4. If Alpha is nearby and we have spare golden_boots, toss them
const alpha = players.find(p => p.username === 'alpha');
if (alpha) {
  const dist = bot.entity.position.distanceTo(alpha.position);
  if (dist <= 6.0) {
    const extraBoots = bot.inventory.items().find(i => i.name === 'golden_boots' && i.slot !== 8);
    if (extraBoots) {
      console.log('Tossing spare golden_boots to Alpha!');
      await bot.lookAt(alpha.position.offset(0, 1.0, 0), true);
      await bot.tossStack(extraBoots);
      bot.chat('gamma: alpha: Golden boots delivered! Equip them on feet!');
      await sleep(800);
    }
  }
}

// 5. Scan for Piglins near the bunker / covered tunnel (dY <= 2.5m)
const reachablePiglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid &&
  Math.abs(e.position.y - bot.entity.position.y) <= 2.5 &&
  bot.entity.position.distanceTo(e.position) <= 16
).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Reachable Piglins near Bunker: ${reachablePiglins.length}`);
for (const rp of reachablePiglins) {
  console.log(`- Piglin at ${lib.fmt(rp.position)}, dist: ${bot.entity.position.distanceTo(rp.position).toFixed(1)}m`);
}

// 6. Barter with nearest reachable Piglin
let ingots = lib.count('gold_ingot');
if (reachablePiglins.length > 0 && ingots > 0) {
  const targetPiglin = reachablePiglins[0];
  console.log(`Bartering ${ingots} gold ingot(s) with Piglin at ${lib.fmt(targetPiglin.position)}...`);
  bot.chat(`gamma: Bartering ${ingots} gold ingot(s) with neutral Piglin at ${lib.fmt(targetPiglin.position)}!`);

  for (let r = 1; r <= ingots && !isCancelled(); r++) {
    const curIngot = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (!curIngot) break;

    await bot.lookAt(targetPiglin.position.offset(0, 0.5, 0), true);
    await bot.toss(mcData.itemsByName.gold_ingot.id, null, 1);
    console.log(`Tossed gold ingot ${r}/${ingots}. Waiting 8.5s for barter drop...`);
    await sleep(8500);
    await lib.pickup(6.0);
    console.log(`Barter round ${r} complete. Pearls: ${lib.count('ender_pearl')}`);
  }
} else {
  console.log('No reachable Piglins on current floor level right now.');
}

// 7. Check for ground items to vacuum
await lib.pickup(6.0);

// 8. Report final pearls and inventory
const pearls = lib.count('ender_pearl');
console.log(`=== END PROGRAM 642: Pearls=${pearls}/12, Gold Ingots=${lib.count('gold_ingot')}, HP=${bot.health.toFixed(1)} ===`);
console.log('Inventory:', lib.inv());
bot.chat(`gamma: Milestone 9 status — Pearls: ${pearls}/12, Gold: ${lib.count('gold_ingot')}, HP: ${bot.health.toFixed(1)}/20.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls,
  ingots: lib.count('gold_ingot'),
  inv: lib.inv(),
  players: players.map(p => ({ name: p.username, pos: p.position }))
};
