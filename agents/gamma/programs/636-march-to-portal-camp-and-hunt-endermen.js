// programs/636-march-to-portal-camp-and-hunt-endermen.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 636: MARCH TO SOUL SAND VALLEY PORTAL CAMP & ENDERMAN HUNT ===');
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

// 2. Configure movement and fire avoidance
globalThis.configureFireAvoidance();

// Safe waypoints from Fortress Workshop Bunker (z=-127) back to Nether Portal Camp (z=-7)
const TRAIL_WAYPOINTS = [
  { x: 44.0, y: 65.0, z: -127.0 },
  { x: 50.0, y: 65.0, z: -115.0 },
  { x: 61.0, y: 66.0, z: -100.0 },
  { x: 62.0, y: 67.0, z: -80.0 },
  { x: 61.5, y: 67.0, z: -75.0 },
  { x: 61.5, y: 67.0, z: -70.0 },
  { x: 61.5, y: 67.0, z: -65.0 },
  { x: 61.5, y: 67.0, z: -60.0 },
  { x: 61.5, y: 67.0, z: -55.0 },
  { x: 62.0, y: 67.0, z: -50.0 },
  { x: 63.0, y: 66.0, z: -35.0 },
  { x: 63.0, y: 65.0, z: -20.0 },
  { x: 63.0, y: 64.0, z: -7.0 },
  { x: 54.0, y: 65.0, z: -7.0 },
  { x: 46.0, y: 65.0, z: -7.0 } // Nether Portal Camp
];

bot.chat('gamma: Marching safe East Ridge trail to Nether Portal Camp (46, 65, -7) in Soul Sand Valley to hunt Endermen!');

for (let i = 0; i < TRAIL_WAYPOINTS.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  await globalThis.clearFireAhead();

  const wp = TRAIL_WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 1.8) continue;

  // Keep gaze low to avoid Enderman gaze aggro while traversing open trail
  await bot.lookAt(new Vec3(wp.x, 63.5, wp.z));

  // Raise shield on exposed sections
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

console.log('Arrived near Portal Camp at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 3. Check for Alpha nearby to hand over golden_boots
let players = Object.values(bot.entities).filter(e => e.type === 'player' && e !== bot.entity);
const alpha = players.find(p => p.username === 'alpha');
if (alpha) {
  const distToAlpha = bot.entity.position.distanceTo(alpha.position);
  console.log(`Alpha spotted at ${lib.fmt(alpha.position)}, dist: ${distToAlpha.toFixed(1)}m`);
  if (distToAlpha <= 8.0) {
    const extraBoots = bot.inventory.items().find(i => i.name === 'golden_boots' && i.slot !== 8);
    if (extraBoots) {
      console.log('Tossing golden_boots to Alpha!');
      await bot.lookAt(alpha.position.offset(0, 1.0, 0), true);
      await bot.tossStack(extraBoots);
      bot.chat('gamma: alpha: Here are golden_boots! Equip them on feet for 100% Piglin neutrality!');
      await sleep(500);
    }
  }
}

// 4. Verify 2-high protective shelter at Portal Camp (46, 65, -7)
// Move to safe spot inside bunker
try {
  await bot.pathfinder.goto(new goals.GoalNear(46.0, 65.0, -7.0, 0.8));
} catch (e) {}

const headBlock = bot.blockAt(bot.entity.position.offset(0, 2, 0));
const isCovered = headBlock && headBlock.boundingBox === 'block';
console.log(`Bunker ceiling above Gamma: ${isCovered} (${headBlock ? headBlock.name : 'air'})`);

// 5. Scan for Endermen across Soul Sand Valley
const endermen = Object.values(bot.entities).filter(e =>
  e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 64
).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Endermen in Soul Sand Valley: ${endermen.length}`);
for (const em of endermen) {
  console.log(`- Enderman at ${lib.fmt(em.position)}, dist: ${bot.entity.position.distanceTo(em.position).toFixed(1)}m`);
}

// 6. Hunt Enderman from under 2-high cover
if (endermen.length > 0 && isCovered) {
  const targetEnderman = endermen[0];
  console.log(`Targeting Enderman at ${lib.fmt(targetEnderman.position)} from 2-high bunker!`);
  bot.chat(`gamma: Provoking Enderman at ${lib.fmt(targetEnderman.position)} into 2-high portal bunker doorway!`);
  
  if (sw) await bot.equip(sw, 'hand');

  // Look directly at Enderman's eyes (height ~2.7) to trigger aggro
  await bot.lookAt(targetEnderman.position.offset(0, 2.7, 0), true);
  await sleep(2500);

  // Attack loop while remaining stationary under the 2-high ceiling
  const combatStart = Date.now();
  let hits = 0;
  while (Date.now() - combatStart < 20000 && targetEnderman.isValid && !isCancelled()) {
    const dist = bot.entity.position.distanceTo(targetEnderman.position);
    if (dist <= 4.2) {
      if (sw) await bot.equip(sw, 'hand');
      bot.attack(targetEnderman);
      hits++;
      await sleep(650);
    } else {
      await bot.lookAt(targetEnderman.position.offset(0, 2.7, 0), true);
      await sleep(200);
    }
  }
  console.log(`Enderman combat finished. Total hits: ${hits}`);
  await sleep(1000);
  await lib.pickup(6.0);
}

// 7. Vacuum any drops around bunker
await lib.pickup(6.0);

// 8. Report final inventory and pearls
const pearls = lib.count('ender_pearl');
console.log(`=== END PROGRAM 636: Pearls=${pearls}/12, HP=${bot.health.toFixed(1)}, Food=${bot.food} ===`);
console.log('Inventory:', lib.inv());
bot.chat(`gamma: Portal Camp status — Pearls: ${pearls}/12, HP: ${bot.health.toFixed(1)}/20, Food: ${bot.food}/20.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls,
  inv: lib.inv(),
  endermen: endermen.length
};
