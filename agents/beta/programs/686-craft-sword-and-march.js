// programs/686-craft-sword-and-march.js
console.log('=== Program 686: Craft Stone Sword & March to Pillbox ===');
console.log('Dimension:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));

// Check Nether base chest if one exists
const chestBlock = bot.findBlock({ matching: mcData.blocksByName.chest.id, maxDistance: 10 });
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    console.log('Nether base chest:', chest.items().map(i => `${i.name}x${i.count}`).join(', '));
    for (const item of chest.items()) {
      if (item.name.includes('cooked') || item.name.includes('bread') || item.name.includes('apple') || item.name.includes('sword') || item.name.includes('shield')) {
        await chest.withdraw(item.type, null, item.count);
      }
    }
    await chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// Craft stone sword if needed
if (lib.count('*_sword') === 0 && lib.count('cobblestone') >= 2) {
  console.log('Crafting stone sword...');
  let ct = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 6 });
  if (!ct && lib.count('crafting_table') > 0) {
    const spot = await lib.freeSpot();
    await lib.place('crafting_table', spot.x, spot.y, spot.z);
    ct = bot.blockAt(spot);
  }
  if (ct) {
    try {
      await lib.craft('stone_sword', 1);
      console.log('Crafted stone sword!');
    } catch (e) {
      console.log('Craft error:', e.message);
    }
  }
}

try { await lib.equipWeapon(); } catch (e) {}
console.log('Weapon equipped. Inv:', JSON.stringify(lib.inv()));

// Announce and march to Pillbox
bot.chat('Beta: Marching to Spawner Pillbox (36, 66, -187)!');
console.log('Starting march to Spawner Pillbox...');
const marchRes = await marchToSpawnerPillbox();
console.log('March completed:', JSON.stringify(marchRes));

// Engage at Pillbox
if (bot.game.dimension === 'the_nether' && bot.entity.position.distanceTo(new Vec3(36, 66, -187)) < 8) {
  bot.chat('Beta: Arrived at Spawner Pillbox! Farming Blaze Rods through firing slit...');
  console.log('Farming Blazes at Pillbox...');
  const farmRes = await farmBlazeRodsAtPillbox(8, 120000);
  console.log('Farm completed:', JSON.stringify(farmRes));

  if (lib.count('blaze_rod') >= 8) {
    bot.chat(`Beta: Goal reached! ${lib.count('blaze_rod')} Blaze Rods secured! Retreating.`);
    await retreatToOverworldBase();
  }
} else {
  console.log('Did not reach Pillbox. Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: lib.count('blaze_rod'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
