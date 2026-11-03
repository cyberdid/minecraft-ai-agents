// programs/805-unite-in-covered-tunnel.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 805: Advance Down Covered Tunnel to Gamma ===');
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

// Keep shield raised for complete safety
bot.activateItem(true);

// Advance north along covered tunnel from z=-126 down to z=-143
const tunnelPoints = [
  new Vec3(44.5, 65.0, -130.0),
  new Vec3(44.5, 65.0, -134.0), // Crafting table here
  new Vec3(44.5, 65.0, -138.0),
  new Vec3(44.5, 65.0, -143.0)  // Gamma position
];

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

for (let i = 0; i < tunnelPoints.length && !isCancelled(); i++) {
  const pt = tunnelPoints[i];
  if (bot.entity.position.distanceTo(pt) < 1.5) continue;
  console.log(`Advancing down covered tunnel to point ${i + 1}/${tunnelPoints.length}: ${lib.fmt(pt)}`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(pt.x, pt.y, pt.z, 0.8));
  } catch (e) {
    console.log(`Pathfinder step ${i + 1} notice:`, e.message);
    await bot.lookAt(pt, true);
    bot.setControlState('forward', true);
    await sleep(800);
    bot.setControlState('forward', false);
  }
}

console.log('Pos at rendezvous:', lib.fmt(bot.entity.position));

// Announce to Gamma
bot.chat('Beta: Gamma, I am united with you inside Covered Tunnel at (44, 65, -143)! 100% Piglin neutrality active!');

// Scan for nearby mobs
const piglins = Object.values(bot.entities).filter(e => e.name === 'piglin' && bot.entity.position.distanceTo(e.position) < 20);
console.log(`Piglins found nearby (${piglins.length}):`, piglins.map(p => `${lib.fmt(p.position)} dist=${bot.entity.position.distanceTo(p.position).toFixed(1)}`).join(', '));

const endermen = Object.values(bot.entities).filter(e => e.name === 'enderman' && bot.entity.position.distanceTo(e.position) < 25);
console.log(`Endermen found nearby (${endermen.length}):`, endermen.map(e => `${lib.fmt(e.position)} dist=${bot.entity.position.distanceTo(e.position).toFixed(1)}`).join(', '));

// Check for dropped items inside tunnel to vacuum
const items = Object.values(bot.entities).filter(e => e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8);
if (items.length > 0) {
  console.log(`Found ${items.length} items dropped nearby, vacuuming...`);
  try { await lib.pickup(6); } catch (e) {}
}

// Safe Enderman Hunt: If an Enderman is in sight, check if we can safely hit it from under 2-high roof
if (endermen.length > 0) {
  const target = endermen[0];
  console.log(`Targeting Enderman at ${lib.fmt(target.position)} from under 2-high roof...`);
  // Stare at Enderman head to aggro
  await bot.lookAt(target.position.offset(0, 2.7, 0), true);
  await sleep(1500);

  // If Enderman approaches to <= 4m
  const startFight = Date.now();
  while (Date.now() - startFight < 8000 && !isCancelled()) {
    const updated = bot.entities[target.id];
    if (!updated || !updated.isValid || updated.health <= 0) break;
    const dist = bot.entity.position.distanceTo(updated.position);
    if (dist <= 3.8) {
      bot.deactivateItem();
      try { await lib.equipWeapon(); } catch (e) {}
      bot.attack(updated);
      await sleep(600);
      bot.activateItem(true);
    }
    await sleep(100);
  }
  try { await lib.pickup(4); } catch (e) {}
}

console.log('=== Program 805 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', lib.inv());
console.log('Ender Pearls count:', lib.count('ender_pearl'));

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  piglins: piglins.length,
  endermen: endermen.length,
  ender_pearls: lib.count('ender_pearl'),
  inv: lib.inv()
};
