// programs/348-verify-gear-and-nether-advance.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Check offhand and main hand
console.log('Offhand slot 45:', bot.inventory.slots[45]?.name);
console.log('Main hand:', bot.entity.heldItem?.name);

// If shield in inventory but not in offhand, equip it
if (bot.inventory.slots[45]?.name !== 'shield') {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) {
    try {
      await bot.equip(shield, 'off-hand');
      console.log('Shield equipped into off-hand!');
    } catch (e) {
      console.log('Equip shield error:', e.message);
    }
  }
}

// Equip stone sword in main hand
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) {
  try {
    await bot.equip(sword, 'hand');
    console.log('Stone sword equipped in main hand!');
  } catch (e) {}
}

// 2. Check base chest at (293, 72, -57) for food/blocks
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    for (const item of items) {
      if (item.name === 'cobblestone' || item.name.includes('cooked') || item.name === 'bread' || item.name === 'apple') {
        try {
          await chest.withdraw(item.type, null, item.count);
          console.log(`Withdrew ${item.name} x${item.count}`);
        } catch (e) {}
      }
    }
    chest.close();
  } catch (e) {}
}

console.log('Inventory before portal:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
console.log('Offhand:', bot.inventory.slots[45]?.name);

// 3. Move into Nether portal at (298, 72, -54)
console.log('Walking to Nether portal...');
try {
  await lib.goTo(297, 72, -54, 1, { timeoutMs: 8000 });
} catch (e) {}

bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(2500);
bot.clearControlStates();

console.log('Waiting for Nether transit...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (!String(bot.game.dimension).includes('nether')) {
  console.log('Nether transit incomplete, retry next turn.');
  return;
}

bot.chat(`delta: Entered Nether with SHIELD in off-hand & ${lib.count('cobblestone')} cobble! Advancing to Spawner Frontline!`);

// 4. Safe exit bunker at z = -8.0
console.log('Exiting bunker at z=-8.0...');
await lib.walkTo(40.5, -8.0, 2000);
bot.clearControlStates();

// 5. Follow valley floor to East Ridge (63, 65, -8)
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

// 6. Sprint through covered corridor
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

// 7. Shield check & place roof over cross-bridge at y=67
// Roof blocks at (38, 67, -176), (37, 67, -176), (38, 67, -177)
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

// 8. Slay any Blazes in range with stone sword
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

// 9. Pick up dropped items (Blaze rods)
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
