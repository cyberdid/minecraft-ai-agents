// programs/505-sprint-to-portal.js
console.log('=== Step: Sprint to Portal & Transit to Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Walk directly to base door (294, 72, -53)
console.log('Navigating straight to base door...');
try {
  await lib.goTo(270, 68, -60, 2.5);
} catch (e) {
  try { await lib.walkTo(270, -60); } catch (e2) {}
}

try {
  await lib.goTo(294, 72, -53, 1.5);
  console.log('Reached base exterior at', lib.fmt(bot.entity.position));
} catch (e) {
  try { await lib.walkTo(294, -53); } catch (e2) {}
}

// 2. Check base chest (293, 72, -57) quickly
try {
  await lib.door(294, 72, -54, true);
  await bot.lookAt(new Vec3(294.5, 72.5, -55.5), true);
  bot.setControlState('forward', true);
  await sleep(800);
  bot.clearControlStates();
  
  const cb = bot.blockAt(new Vec3(293, 72, -57));
  if (cb) {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('Base chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));
    for (const it of items) {
      if (it.name.startsWith('cooked_') || it.name.endsWith('_sword') || it.name.endsWith('_pickaxe') || it.name === 'cobblestone' || it.name.endsWith('_planks') || it.name === 'shield') {
        await chest.withdraw(it.type, null, it.count);
        console.log(`Withdrew ${it.name}x${it.count}!`);
      }
    }
    chest.close();
  }
} catch (e) {
  console.log('Chest check note:', e.message);
}

try { await lib.equipArmor(); } catch (e) {}

// 3. Step onto Nether Portal block at (299.5, 73.0, -54.0)
console.log('Stepping into Nether Portal block (299.5, 73.0, -54.0)...');
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

// 4. Wait for Nether transit (80 ticks = 4s in survival)
for (let s = 0; s < 12; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
    console.log(`SUCCESS: IN THE NETHER at second ${s+1}! Pos:`, lib.fmt(bot.entity.position));
    break;
  }
}

console.log('Dimension now:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
bot.chat(`beta: In dimension ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}! Advancing to Fortress tunnel!`);
