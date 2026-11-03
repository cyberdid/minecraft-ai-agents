// programs/641-deliver-boots-to-alpha-on-ridge.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 641: DELIVER BOOTS TO ALPHA ON RIDGE & HUNT ENDERMEN ===');
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

// Waypoints to ridge tunnel
const RIDGE_WAYPOINTS = [
  { x: 46.0, y: 65.0, z: -7.0 },
  { x: 54.0, y: 65.0, z: -7.0 },
  { x: 63.0, y: 64.0, z: -7.0 },
  { x: 63.0, y: 65.0, z: -15.0 },
  { x: 62.0, y: 67.0, z: -25.0 }
];

bot.chat('gamma: Moving along East Ridge trail towards Alpha to deliver golden_boots and hunt Endermen!');

let bootsDelivered = false;

for (let i = 0; i < RIDGE_WAYPOINTS.length && !isCancelled(); i++) {
  if (bot.game.dimension !== 'the_nether') break;

  await globalThis.clearFireAhead();

  const wp = RIDGE_WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 1.8) continue;

  await bot.lookAt(new Vec3(wp.x, 63.5, wp.z));

  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    try {
      await globalThis.clearFireAhead();
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
    } catch (e2) {}
  }

  // Check if Alpha is within 5m during march
  const players = Object.values(bot.entities).filter(e => e.type === 'player' && e !== bot.entity);
  const alpha = players.find(p => p.username === 'alpha');
  if (alpha && !bootsDelivered) {
    const dist = bot.entity.position.distanceTo(alpha.position);
    console.log(`Alpha nearby at ${lib.fmt(alpha.position)}, dist: ${dist.toFixed(1)}m`);
    if (dist <= 5.0) {
      const extraBoots = bot.inventory.items().find(i => i.name === 'golden_boots' && i.slot !== 8);
      if (extraBoots) {
        console.log('Tossing golden_boots to Alpha!');
        await bot.lookAt(alpha.position.offset(0, 1.0, 0), true);
        await bot.tossStack(extraBoots);
        bot.chat('gamma: alpha: Golden boots delivered! Equip on feet for 100% Piglin neutrality!');
        bootsDelivered = true;
        await sleep(1000);
      }
    }
  }
}

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

console.log('Arrived on ridge at:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 3. If boots not yet delivered, scan for Alpha within 16m
if (!bootsDelivered) {
  const players = Object.values(bot.entities).filter(e => e.type === 'player' && e !== bot.entity);
  const alpha = players.find(p => p.username === 'alpha');
  if (alpha) {
    const dist = bot.entity.position.distanceTo(alpha.position);
    console.log(`Alpha dist on ridge: ${dist.toFixed(1)}m`);
    if (dist <= 6.0) {
      const extraBoots = bot.inventory.items().find(i => i.name === 'golden_boots' && i.slot !== 8);
      if (extraBoots) {
        await bot.lookAt(alpha.position.offset(0, 1.0, 0), true);
        await bot.tossStack(extraBoots);
        bot.chat('gamma: alpha: Golden boots tossed to you! Equip on feet!');
        bootsDelivered = true;
        await sleep(1000);
      }
    } else if (dist <= 16.0) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(alpha.position.x, alpha.position.y, alpha.position.z, 3.0));
        const extraBoots = bot.inventory.items().find(i => i.name === 'golden_boots' && i.slot !== 8);
        if (extraBoots) {
          await bot.lookAt(alpha.position.offset(0, 1.0, 0), true);
          await bot.tossStack(extraBoots);
          bot.chat('gamma: alpha: Golden boots tossed to you!');
          bootsDelivered = true;
          await sleep(1000);
        }
      } catch (e) {}
    }
  }
}

// 4. Scan for Endermen in Soul Sand Valley
const endermen = Object.values(bot.entities).filter(e =>
  e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 64
).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

console.log(`Endermen tracked: ${endermen.length}`);
for (const em of endermen) {
  console.log(`- Enderman at ${lib.fmt(em.position)}, dist: ${bot.entity.position.distanceTo(em.position).toFixed(1)}m`);
}

// 5. Check if under 2-high protective ceiling
const roof = bot.blockAt(bot.entity.position.offset(0, 2, 0));
const isCovered = roof && roof.boundingBox === 'block';
console.log(`Is Gamma under 2-high roof? ${isCovered} (${roof ? roof.name : 'air'})`);

if (endermen.length > 0 && isCovered) {
  const em = endermen[0];
  console.log(`Provoking Enderman at ${lib.fmt(em.position)} from 2-high tunnel!`);
  bot.chat(`gamma: Targeting Enderman at ${lib.fmt(em.position)} from safe 2-high ridge tunnel!`);
  
  if (sw) await bot.equip(sw, 'hand');
  await bot.lookAt(em.position.offset(0, 2.7, 0), true);
  await sleep(2500);

  const combatStart = Date.now();
  let hits = 0;
  while (Date.now() - combatStart < 18000 && em.isValid && !isCancelled()) {
    const dist = bot.entity.position.distanceTo(em.position);
    if (dist <= 4.2) {
      if (sw) await bot.equip(sw, 'hand');
      bot.attack(em);
      hits++;
      await sleep(650);
    } else {
      await bot.lookAt(em.position.offset(0, 2.7, 0), true);
      await sleep(200);
    }
  }
  console.log(`Combat complete. Total hits: ${hits}`);
  await sleep(1000);
  await lib.pickup(6.0);
}

// 6. Vacuum items nearby
await lib.pickup(5.0);

// 7. Report inventory and pearls
const pearls = lib.count('ender_pearl');
console.log(`=== END PROGRAM 641: Pearls=${pearls}/12, BootsDelivered=${bootsDelivered}, HP=${bot.health.toFixed(1)} ===`);
console.log('Inventory:', lib.inv());
bot.chat(`gamma: Ridge update — Pearls: ${pearls}/12, HP: ${bot.health.toFixed(1)}/20, Boots delivered: ${bootsDelivered}.`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  bootsDelivered,
  pearls,
  endermen: endermen.length,
  inv: lib.inv()
};
