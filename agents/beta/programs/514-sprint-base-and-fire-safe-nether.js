// programs/514-sprint-base-and-fire-safe-nether.js
console.log('=== Step: Sprint to Base, Gear up & Fire-Safe Nether March ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Sprint East to base (294, 72, -54)
const target = new Vec3(294, 72, -53);
console.log('Moving East across Overworld to base...');

try {
  await lib.goTo(240, 64, -50, 3.0);
} catch (e) {
  try { await lib.walkTo(240, -50); } catch (e2) {}
}

try {
  await lib.goTo(target.x, target.y, target.z, 1.5);
  console.log('At base door exterior:', lib.fmt(bot.entity.position));
} catch (e) {
  try { await lib.walkTo(target.x, target.z); } catch (e2) {}
}

// 2. Step inside base, set spawn, check chest
try {
  await lib.door(294, 72, -54, true);
  await bot.lookAt(new Vec3(294.5, 72.5, -55.5), true);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.clearControlStates();
  await lib.door(294, 72, -54, false);
} catch (e) {
  try { await lib.goThroughDoor(294, 72, -54, { close: true }); } catch (e2) {}
}

try { await lib.setSpawn(); } catch (e) {}

// Check base chest for gear
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Base chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));
    for (const it of items) {
      if (it.name.endsWith('_pickaxe') || it.name.endsWith('_sword') || it.name === 'cobblestone' || it.name.endsWith('_planks') || it.name.startsWith('cooked_') || it.name === 'shield') {
        await chest.withdraw(it.type, null, it.count);
        console.log(`Withdrew ${it.name}x${it.count}!`);
      }
    }
    chest.close();
  } catch (e) {}
}

try { await lib.equipArmor(); } catch (e) {}

// 3. Step into Nether portal block at (299.5, 73.0, -54.0)
console.log('Moving into Nether Portal...');
try {
  await lib.goTo(299.5, 73.0, -54.0, 0.4);
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.5, -54.0), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  await sleep(400);
  bot.clearControlStates();
}

bot.clearControlStates();
console.log('Standing still inside portal at:', lib.fmt(bot.entity.position));

// 4. Wait for Nether transit (takes 80 ticks = 4s in survival)
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
    console.log(`SUCCESS: ENTERED THE NETHER at second ${s+1}! Pos:`, lib.fmt(bot.entity.position));
    break;
  }
}

console.log('Dimension now:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
bot.chat(`beta: In dimension ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}. Heading along East Ridge to Fortress tunnel!`);
