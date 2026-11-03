// programs/441-regear-portal-assault.js
console.log('=== GAMMA REGEAR, ENTER NETHER & ASSAULT PILLBOX ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

// 1. Check chest at (293, 72, -57) for shield / iron / armor if in Overworld
if (bot.game.dimension === 'overworld') {
  try {
    const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
    if (chestBlock) {
      await bot.pathfinder.goto(new goals.GoalNear(293, 72, -57, 2));
      const chest = await bot.openContainer(chestBlock);
      const items = chest.items();
      console.log('Base chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));
      // Grab shield or iron armor or food if available
      for (const item of items) {
        if (item.name === 'shield' || item.name.includes('iron_') || item.name.includes('cooked_') || item.name.includes('bread')) {
          try {
            await chest.withdraw(item.type, null, item.count);
            console.log(`Withdrew ${item.name} x${item.count}`);
          } catch (e) {}
        }
      }
      chest.close();
    }
  } catch (e) {
    console.log('Chest access note:', e.message);
  }

  // 2. Quick regear (ensures pickaxe, sword, cobble, armor/weapon equipped)
  console.log('Executing quickRegear({ cobble: 16 })...');
  try {
    await quickRegear({ cobble: 16 });
  } catch (e) {
    console.log('quickRegear note:', e.message);
  }

  // 3. If no shield, attempt to craft one if we have wood & iron
  if (lib.count('shield') === 0 && bot.inventory.slots[45]?.name !== 'shield') {
    try {
      console.log('Attempting to obtain shield...');
      await lib.obtain('shield', 1);
    } catch (e) {
      console.log('Obtain shield note:', e.message);
    }
  }

  // 4. Equip shield in offhand if present
  if (bot.inventory.slots[45]?.name !== 'shield') {
    const s = bot.inventory.items().find(i => i.name === 'shield');
    if (s) {
      await bot.equip(s, 'off-hand');
      console.log('Shield equipped in offhand!');
    }
  }
}

// 5. Enter Nether Portal
console.log('Entering Nether Portal...');
bot.chat('gamma: Entering Nether portal to join team at Spawner Pillbox!');
const warp = await enterNetherPortal();
console.log('Nether warp result:', warp);

if (bot.game.dimension !== 'the_nether') {
  throw new Error('Failed to enter the_nether dimension');
}

// 6. March to Spawner Pillbox
console.log('Marching along safe waypoints to Spawner Pillbox (36, 66, -187)...');
bot.chat('gamma: In Nether! Fast marching via safe covered waypoints to Spawner Pillbox (36, 66, -187)...');
const march = await marchToSpawnerPillbox();
console.log('March result:', march);

// 7. Farm Blaze Rods at Pillbox
console.log('At Pillbox! Beginning Blaze Rod harvest...');
bot.chat('gamma: In Spawner Pillbox! Slaying Blazes for Milestone 8 (Blaze Rods)!');
const farm = await farmBlazeRodsAtPillbox(8, 120000);
console.log('Farm result:', farm);

const totalRods = lib.count('blaze_rod');
bot.chat(`gamma: Combat round complete. Blaze Rods held: ${totalRods}/8, HP: ${bot.health.toFixed(1)}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  rods: totalRods,
  farm
};
