// programs/416-craft-sword-and-march.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'food:', bot.food);

// 1. Craft stone sword if missing
if (lib.count('*_sword') === 0) {
  console.log('Crafting stone_sword...');
  try {
    // Delta has 2 cobblestone + 2 sticks + wood/planks.
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted successfully!');
  } catch (e) {
    console.log('Craft stone_sword note:', e.message);
  }
}

try { await lib.equipWeapon(); } catch (e) {}
console.log('Held weapon:', bot.heldItem?.name);

// 2. March into Nether and to the Spawner Pillbox!
console.log('Marching to Spawner Pillbox...');
bot.chat('delta: Geared and marching to Spawner Pillbox (36, 66, -187)!');
const marchRes = await marchToSpawnerPillbox();
console.log('March result:', JSON.stringify(marchRes));

// 3. Farm Blaze Rods at the Pillbox
console.log('Starting Blaze Rod farming at Pillbox...');
const farmRes = await farmBlazeRodsAtPillbox(8, 90000);
console.log('Farm result:', JSON.stringify(farmRes));

// 4. Report status
const totalRods = lib.count('blaze_rod');
console.log(`Total Blaze Rods held: ${totalRods}`);
bot.chat(`delta: Farming cycle complete. Blaze rods: ${totalRods}/8, HP: ${bot.health.toFixed(1)}`);

// If we reached 8 rods, return to overworld base
if (totalRods >= 8) {
  console.log('Target reached! Retreating to overworld base...');
  bot.chat('delta: 8+ Blaze Rods harvested! Retreating to Overworld base.');
  const retRes = await retreatToOverworldBase();
  console.log('Retreat result:', JSON.stringify(retRes));
}
