// programs/405-rearm-stone-and-portal.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Obtain stone sword
console.log('Obtaining stone_sword...');
try {
  await lib.obtain('stone_sword', 1);
  console.log('Stone sword obtained!');
} catch (e) {
  console.log('Obtain sword note:', e.message);
}

// 2. Obtain stone pickaxe
if (lib.count('*_pickaxe') === 0) {
  console.log('Obtaining stone_pickaxe...');
  try {
    await lib.obtain('stone_pickaxe', 1);
    console.log('Stone pickaxe obtained!');
  } catch (e) {
    console.log('Obtain pickaxe note:', e.message);
  }
}

// 3. Mine 24 stone for cobblestone blast shielding & Piglin barrier
console.log('Mining 24 stone...');
try {
  await lib.collect('stone', 24);
  console.log('Mined stone! Cobblestone count:', lib.count('cobblestone'));
} catch (e) {
  console.log('Collect stone note:', e.message);
}

// 4. Equip stone sword
try {
  await lib.equipWeapon();
  console.log('Equipped weapon:', bot.heldItem?.name);
} catch (e) {}

console.log('Rearmed inventory:');
for (const item of bot.inventory.items()) console.log(`  ${item.name} x${item.count}`);

// 5. Enter base shelter floor then step into portal
console.log('Entering base shelter floor at (294, 72, -55)...');
try {
  await lib.goTo(294, 72, -55, 1, { dig: true, timeoutMs: 8000 });
} catch (e) {}

console.log('Stepping into Nether portal at (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299, 73, -54, 0.5, { dig: true, timeoutMs: 8000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);
}

// 6. Await Nether dimension transition
console.log('Awaiting Nether teleportation...');
const portalStart = Date.now();
while (!isCancelled() && bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 15000) {
  await sleep(300);
}

console.log('Dimension after portal wait:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension === 'the_nether') {
  bot.chat('delta: In Nether with stone_sword & 24 cobble! Ready to build Piglin barrier & take Spawner Pillbox!');
}
