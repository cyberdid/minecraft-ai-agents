// programs/417-gold-and-spawner-assault.js
console.log('=== DAWN NETHER EXPEDITION & BLAZE SPAWNER ASSAULT ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Enter Nether portal
if (bot.game.dimension === 'overworld') {
  console.log('Entering Nether Portal via robust enterNetherPortal()...');
  const portalRes = await globalThis.enterNetherPortal();
  console.log('Portal transit result:', JSON.stringify(portalRes));
}

if (bot.game.dimension !== 'the_nether') {
  console.log('Error: Not in the_nether. Pos:', lib.fmt(bot.entity.position));
  return { error: 'Failed to enter nether' };
}

bot.chat('gamma: In the Nether at portal bunker (40, 65, -7)! Equipping weapon and scanning for gold ore...');

// 2. Scan for nether_gold_ore near bunker
if (lib.count('golden_boots') === 0 && lib.count('golden_helmet') === 0) {
  try {
    const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
    if (goldOreId) {
      const goldOres = bot.findBlocks({ matching: goldOreId, maxDistance: 12, count: 8 });
      console.log(`Found ${goldOres.length} nether_gold_ore blocks nearby!`);
      if (goldOres.length >= 4) {
        for (const p of goldOres.slice(0, 6)) {
          if (isCancelled()) break;
          try {
            await lib.dig(p.x, p.y, p.z);
            await lib.pickup(3);
          } catch (e) {}
        }
        console.log(`Gold nuggets mined: ${lib.count('gold_nugget')}`);
        if (lib.count('gold_nugget') >= 36) {
          // Craft 4 gold ingots
          let ct = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 6 });
          if (!ct && lib.count('crafting_table') > 0) {
            const spot = await lib.freeSpot();
            await lib.place('crafting_table', spot.x, spot.y, spot.z);
            ct = bot.blockAt(spot);
          }
          if (ct) {
            try {
              await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
              console.log('Crafted gold ingots:', lib.count('gold_ingot'));
              if (lib.count('gold_ingot') >= 4) {
                await lib.craft('golden_boots', 1);
                await lib.equipArmor();
                console.log('Equipped golden_boots! Piglin neutrality secured!');
                bot.chat('gamma: Equipped golden_boots! 100% Piglin immunity active!');
              }
            } catch (err) {
              console.log('Gold craft note:', err.message);
            }
          }
        }
      }
    }
  } catch (e) {
    console.log('Gold mining check note:', e.message);
  }
}

// 3. March to Spawner Pillbox along verified safe waypoints
console.log('Executing safe march to Spawner Pillbox...');
bot.chat('gamma: Marching to Spawner Pillbox (37, 66, -186) to join team!');
const marchRes = await globalThis.marchToSpawnerPillbox();
console.log('March completed:', JSON.stringify(marchRes));

// 4. Farm Blazes at Spawner Pillbox
const pillboxPos = new Vec3(37, 66, -186);
const dist = bot.entity.position.distanceTo(pillboxPos);
console.log(`Arrived at dist=${dist.toFixed(1)}m from Pillbox. Pos=${lib.fmt(bot.entity.position)}`);

if (bot.game.dimension === 'the_nether' && dist <= 10) {
  bot.chat('gamma: In Spawner Pillbox with Delta! Slaying Blazes through firing slit...');
  console.log('Farming Blazes...');
  const farmRes = await globalThis.farmBlazeRodsAtPillbox(8, 120000);
  console.log('Farm completed:', JSON.stringify(farmRes));

  const totalRods = lib.count('blaze_rod');
  console.log(`Total Blaze Rods: ${totalRods}`);
  if (totalRods >= 8) {
    bot.chat(`gamma: MILESTONE 8 COMPLETE! Harvested ${totalRods} Blaze Rods!`);
    console.log('Retreating to Overworld base...');
    await globalThis.retreatToOverworldBase();
  }
}

return {
  dim: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: lib.count('blaze_rod')
};
