// programs/568-gear-up-in-base.js
console.log('=== Program 568: Gear Up in Base & Prepare Nether Expedition ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
  console.log('Base door closed!');
} catch (e) {}

// 2. Check nearby players
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)}m)`);
  }
}

// 3. Pickup any item drops inside base
try {
  await lib.pickup(6);
} catch (e) {}
console.log('Alpha inv after pickup:', lib.inv());

// 4. Check chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock && chestBlock.name.includes('chest')) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log('Chest contents:', items.map(it => `${it.name} x${it.count}`));
    // Withdraw any food, cobble, planks, tools, gold
    for (const it of items) {
      if (/food|bread|beef|mutton|porkchop|apple|cobble|plank|sword|pickaxe|gold|iron/.test(it.name)) {
        console.log(`Withdrawing ${it.name} x${it.count}...`);
        await chest.withdraw(it.type, null, it.count);
        await sleep(100);
      }
    }
    await chest.close();
  } catch (ce) {
    console.log('Chest note:', ce.message);
  }
}

console.log('Alpha final inv in base:', lib.inv());
bot.chat(`alpha: Inside base shelter! HP: ${bot.health.toFixed(1)}/20. Current inv: ${JSON.stringify(lib.inv())}`);
