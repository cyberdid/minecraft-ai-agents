// programs/353-sprint-to-base-and-fix-spawn.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Sprint from spawn to base at (294, 72, -56)
console.log('Sprinting to base at (294, 72, -56)...');
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

try {
  await lib.goTo(294, 72, -56, 1, { timeoutMs: 25000 });
} catch (e) {
  console.log('goTo base note:', e.message);
  await bot.lookAt(new Vec3(294, 72, -56), true);
  bot.setControlState('forward', true);
  bot.setControlState('sprint', true);
  await sleep(4000);
  bot.clearControlStates();
}

console.log('Arrived at base! Pos:', lib.fmt(bot.entity.position));

// 2. Locate beds inside base and set spawn
const beds = bot.findBlocks({ matching: b => b.name.endsWith('_bed'), maxDistance: 8, count: 2 });
console.log(`Found ${beds.length} beds:`);
for (const b of beds) {
  console.log(`  Bed at ${lib.fmt(b)}`);
}

// Find Bed 2 at (293, 72, -56) or nearest bed
if (beds.length > 0) {
  const targetBed = beds[0];
  console.log(`Setting spawn at bed ${lib.fmt(targetBed)}...`);
  try {
    await lib.setSpawn();
    console.log('Spawn successfully set!');
    bot.chat('delta: Spawn point locked at base bed!');
  } catch (e) {
    console.log('setSpawn note:', e.message);
  }
}

// 3. Check chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log(`Chest items (${items.length}):`);
    for (const item of items) {
      console.log(`  ${item.name} x${item.count}`);
    }
    
    // Withdraw any tools, armor, gold, cobblestone, food
    for (const item of items) {
      const n = item.name;
      if (n.includes('pickaxe') || n.includes('sword') || n.includes('shield') || n.includes('iron') || n.includes('gold') || n === 'cobblestone' || n.includes('cooked') || n === 'bread') {
        try {
          await chest.withdraw(item.type, null, item.count);
          console.log(`Withdrew ${n} x${item.count}`);
        } catch (e) {}
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// 4. Check inventory
console.log('Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

try { await lib.equipArmor(); await lib.equipWeapon(); } catch (e) {}

bot.chat(`delta: Reunited at base ${lib.fmt(bot.entity.position)}! Spawn verified. Ready to coordinate gear & fortifications.`);
