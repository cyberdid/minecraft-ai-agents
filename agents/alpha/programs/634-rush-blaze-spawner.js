// programs/634-rush-blaze-spawner.js
console.log('=== Program 634: Fast Regear & Nether Blaze Spawner Assault ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Inv:', lib.inv());

// Step 1: Head to base if in overworld
if (bot.game.dimension === 'overworld') {
  console.log('Moving towards base (293, 72, -55)...');
  try {
    await lib.goTo(293, 72, -55, 2, { timeoutMs: 15000 });
  } catch (err) {
    console.log('goTo base note:', err.message);
  }
  
  // Set spawn bed
  try {
    await lib.setSpawn();
    console.log('Spawn set at base bed!');
  } catch (err) {
    console.log('Set spawn note:', err.message);
  }

  // Check base chest for gear
  const chestBlock = bot.findBlock({ matching: b => b && b.name.includes('chest'), maxDistance: 6 });
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const items = chest.containerItems();
      console.log('Chest items:', items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
      for (const item of items) {
        if (item.name.includes('sword') || item.name.includes('pickaxe') || item.name.includes('shield') ||
            item.name.includes('armor') || item.name.includes('helmet') || item.name.includes('chestplate') ||
            item.name.includes('leggings') || item.name.includes('boots') || item.name.includes('cooked') ||
            item.name.includes('bread') || item.name.includes('beef') || item.name.includes('mutton') ||
            item.name.includes('porkchop') || item.name === 'cobblestone' || item.name === 'blaze_rod') {
          try {
            await chest.withdraw(item.type, null, item.count);
            console.log(`Withdrew ${item.name}x${item.count}`);
          } catch (e) {}
        }
      }
      chest.close();
    } catch (e) {
      console.log('Chest access note:', e.message);
    }
  }

  // Step 2: Preloaded fast regear helper
  console.log('Executing quickRegear({ cobble: 16 })...');
  const regearResult = await quickRegear({ cobble: 16 });
  console.log('Regear result:', regearResult);
  console.log('Current inv:', lib.inv());

  // Step 3: Enter Nether portal
  console.log('Executing enterNetherPortal()...');
  const portalResult = await enterNetherPortal();
  console.log('Portal result:', portalResult);
}

// Step 4: March to Spawner Pillbox
if (bot.game.dimension === 'the_nether') {
  bot.chat(`${bot.username}: In Nether, marching along covered waypoints to Blaze Spawner Pillbox!`);
  console.log('Executing marchToSpawnerPillbox()...');
  const marchResult = await marchToSpawnerPillbox();
  console.log('March result:', marchResult);

  // Step 5: Farm Blaze Rods at Pillbox
  console.log('Executing farmBlazeRodsAtPillbox(8, 90000)...');
  const farmResult = await farmBlazeRodsAtPillbox(8, 90000);
  console.log('Farm result:', farmResult);

  // If reached target rods or need retreat
  if (lib.count('blaze_rod') >= 8) {
    bot.chat(`${bot.username}: Milestone 8 COMPLETE! Harvested ${lib.count('blaze_rod')} Blaze Rods!`);
    console.log('Milestone 8 COMPLETE! Retreating to Overworld Base...');
    await retreatToOverworldBase();
  }
}

console.log('=== Program 634 Complete ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food, 'Rods:', lib.count('blaze_rod'), 'Inv:', lib.inv());
