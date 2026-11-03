// programs/409-spawner-assault.js
console.log('=== FAST NETHER / END STAGE ASSAULT (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Quick Base Chest check for food / armor if in Overworld
if (bot.game.dimension === 'overworld') {
  try {
    const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
    if (chestBlock) {
      console.log('Checking base chest for supplies...');
      await bot.pathfinder.goto(new goals.GoalNear(293, 72, -57, 2));
      const chest = await bot.openContainer(chestBlock);
      const items = chest.items();
      console.log('Chest contents:', items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
      for (const item of items) {
        if (
          item.name.includes('helmet') ||
          item.name.includes('chestplate') ||
          item.name.includes('leggings') ||
          item.name.includes('boots') ||
          item.name.includes('shield') ||
          item.name.includes('cooked') ||
          item.name.includes('bread') ||
          item.name.includes('porkchop') ||
          item.name.includes('steak') ||
          item.name.includes('beef') ||
          item.name.includes('mutton') ||
          item.name.includes('golden_') ||
          item.name.includes('iron_sword')
        ) {
          try {
            await chest.withdraw(item.type, null, Math.min(item.count, 16));
            console.log(`Withdrew ${item.name} x${item.count}`);
          } catch (err) {}
        }
      }
      await chest.close();
    }
  } catch (e) {
    console.log('Chest access note:', e.message);
  }
}

// 2. Preloaded Quick Regear
console.log('Running quickRegear...');
const regearRes = await globalThis.quickRegear({ cobble: 16 });
console.log('Regear result:', JSON.stringify(regearRes));

// Eat if food available and hungry
if (bot.food < 18) {
  try { await lib.eat(); } catch (e) {}
}

// 3. March to Spawner Pillbox
bot.chat('gamma: Marching to Spawner Pillbox (36, 66, -187) via safe waypoints!');
console.log('Calling marchToSpawnerPillbox()...');
const marchRes = await globalThis.marchToSpawnerPillbox();
console.log('March result:', JSON.stringify(marchRes));

// 4. Farm Blaze Rods at Pillbox
console.log('At Spawner Pillbox! Engaging Blazes...');
bot.chat('gamma: At Spawner Pillbox! Engaging Blazes for Blaze Rods.');
const farmRes = await globalThis.farmBlazeRodsAtPillbox(8, 90000);
console.log('Farming result:', JSON.stringify(farmRes));

// 5. Final check
const totalRods = lib.count('blaze_rod');
console.log(`End of run: Blaze Rods = ${totalRods}, HP = ${bot.health}, Pos = ${lib.fmt(bot.entity.position)}`);
if (totalRods >= 8) {
  bot.chat(`gamma: MILESTONE REACHED! Harvested ${totalRods} Blaze Rods!`);
}
return { rods: totalRods, hp: bot.health, pos: bot.entity.position, dim: bot.game.dimension };
