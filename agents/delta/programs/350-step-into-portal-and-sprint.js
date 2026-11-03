// programs/350-step-into-portal-and-sprint.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Inspect terrain leading to portal
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Target portal block:', lib.fmt(portalTarget));

// If ground between bot and portal needs a step, place one
const stepSpot = new Vec3(301, 72, -54);
const stepBlock = bot.blockAt(stepSpot);
if (stepBlock && stepBlock.name === 'air') {
  console.log('Placing cobblestone step at (301, 72, -54)...');
  try {
    await lib.place('cobblestone', 301, 72, -54);
  } catch (e) {
    console.log('Step place error:', e.message);
  }
}

// Walk/jump directly into the portal block
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

await bot.lookAt(portalTarget, true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(2000);
bot.clearControlStates();

console.log('Position inside portal area:', lib.fmt(bot.entity.position));

// Hold position inside portal block for dimension change
console.log('Holding position inside portal for dimension change...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  // Ensure we remain centered inside (299.5, 73.0, -54.0)
  if (bot.entity.position.distanceTo(portalTarget) > 1.2) {
    await bot.lookAt(portalTarget, true);
    bot.setControlState('forward', true);
    await sleep(200);
    bot.clearControlStates();
  }
  await sleep(400);
}

console.log('Dimension now:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (!String(bot.game.dimension).includes('nether')) {
  console.log('Portal transit did not occur within 15s.');
  return;
}

bot.chat(`delta: Entered Nether with offhand SHIELD & stone sword! Sprinting to Spawner Frontline!`);

// 2. Safe exit bunker at z = -8.0
console.log('Exiting bunker at z=-8.0...');
await lib.walkTo(40.5, -8.0, 2000);
bot.clearControlStates();

// 3. Follow valley floor to East Ridge (63, 65, -8)
const toRidge = [
  new Vec3(48, 65, -8),
  new Vec3(56, 65, -8),
  new Vec3(63, 65, -8)
];
for (const wp of toRidge) {
  if (isCancelled()) break;
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1, { timeoutMs: 6000 });
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    await sleep(1500);
    bot.clearControlStates();
  }
}

// 4. Sprint through covered corridor
const corridor = [
  new Vec3(63.0, 65.0, -15),
  new Vec3(63.0, 65.0, -30),
  new Vec3(62.0, 65.0, -50),
  new Vec3(62.0, 65.0, -70),
  new Vec3(62.0, 65.0, -90),
  new Vec3(61.0, 65.0, -100),
  new Vec3(50.0, 65.0, -115),
  new Vec3(44.0, 65.0, -127), // Fortress Workshop Bunker
  new Vec3(44.0, 65.0, -145), // Covered Advance Tunnel
  new Vec3(44.0, 65.0, -160),
  new Vec3(44.0, 65.0, -169), // Frontline Blast Wall
  new Vec3(38.0, 65.0, -176)  // Fortified Cross-Bridge
];

for (let i = 0; i < corridor.length && !isCancelled(); i++) {
  const wp = corridor[i];
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.2));
  } catch (e) {
    await bot.lookAt(new Vec3(wp.x, wp.y + 1, wp.z), true);
    bot.setControlState('forward', true);
    bot.setControlState('sprint', true);
    await sleep(1500);
    bot.clearControlStates();
  }
}

console.log('Arrived at fortified cross-bridge! Pos:', lib.fmt(bot.entity.position));

// 5. Shield check & place roof over cross-bridge at y=67
const roofSpots = [
  new Vec3(38, 67, -176),
  new Vec3(37, 67, -176),
  new Vec3(38, 67, -177),
  new Vec3(37, 67, -177)
];

for (const spot of roofSpots) {
  const b = bot.blockAt(spot);
  if (b && (b.name === 'air' || b.name === 'cave_air')) {
    const filler = lib.count('cobblestone') > 0 ? 'cobblestone' : (lib.count('andesite') > 0 ? 'andesite' : null);
    if (!filler) break;
    try {
      console.log(`Placing blast roof ${filler} at ${lib.fmt(spot)}...`);
      await lib.place(filler, spot.x, spot.y, spot.z);
    } catch (e) {
      console.log(`Roof place error at ${lib.fmt(spot)}:`, e.message);
    }
  }
}

// 6. Slay Blazes in range with stone sword
const blazes = Object.values(bot.entities).filter(e => e && e.name === 'blaze' && bot.entity.position.distanceTo(e.position) < 6);
console.log(`Blazes in range: ${blazes.length}`);
if (blazes.length > 0) {
  const target = blazes[0];
  console.log(`Attacking Blaze at ${lib.fmt(target.position)}!`);
  await bot.lookAt(target.position.offset(0, 1, 0), true);
  await bot.attack(target);
  await sleep(600);
  await bot.attack(target);
}

// 7. Pick up dropped items (Blaze rods)
try {
  const picked = await lib.pickup(8);
  console.log('Pickup count:', picked);
} catch (e) {}

console.log('Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
console.log('Offhand:', bot.inventory.slots[45]?.name);

bot.chat(`delta: Spawner bridgehead fortified! Offhand: ${bot.inventory.slots[45]?.name || 'none'}, Rods: ${lib.count('blaze_rod')}, HP: ${bot.health}/20`);
