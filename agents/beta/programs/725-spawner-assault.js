// programs/725-spawner-assault.js
// Execute Stage 2 Spawner Assault to harvest 8+ Blaze Rods for Milestone 8
console.log('=== Program 725: Spawner Assault (Milestone 8) ===');
console.log('Bot:', bot.username, 'Pos:', lib.fmt(bot.entity.position), 'Dim:', bot.game.dimension, 'HP:', bot.health);
console.log('Inventory:', lib.inv());

// Reload latest overrides
require('/home/cyberdid/Projects/Minecraft/agents/beta/autoload.js');

// Equip shield in offhand and sword in hand
const offhand = bot.inventory.slots[45];
if (offhand?.name !== 'shield') {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
}
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

console.log('Offhand:', bot.inventory.slots[45]?.name, 'Held:', bot.heldItem?.name);

// Step 1: March to Pillbox (handles Overworld portal warp if in Overworld)
console.log('Executing marchToSpawnerPillbox()...');
const marchResult = await marchToSpawnerPillbox();
console.log('March complete! Pos:', lib.fmt(bot.entity.position), 'Dim:', bot.game.dimension, 'HP:', bot.health);

// Step 2: If at or near Pillbox, engage in combat
const distToPillbox = bot.entity.position.distanceTo(new Vec3(36.5, 66.0, -187.0));
console.log('Distance to pillbox firing position:', distToPillbox.toFixed(1));

if (bot.game.dimension === 'the_nether' && distToPillbox < 8.0) {
  bot.chat(`Beta: At Spawner Pillbox! Slaying Blazes with Active Shield Block! Current rods: ${lib.count('blaze_rod')}/8`);
  
  // Farm until 8 rods or timeout
  const farmResult = await farmBlazeRodsAtPillbox(8, 120000);
  console.log('Farm result:', farmResult);
  
  const rods = lib.count('blaze_rod');
  bot.chat(`Beta: Combat round complete. Blaze Rods: ${rods}/8, HP: ${bot.health.toFixed(1)}`);
  
  if (rods >= 8) {
    bot.chat(`Beta: 8+ BLAZE RODS SECURED! Retreating to Overworld Base!`);
    await retreatToOverworldBase();
    if (bot.game.dimension === 'overworld') {
      try {
        const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
        if (chestBlock) {
          const chest = await bot.openChest(chestBlock);
          const rodItem = bot.inventory.items().find(i => i.name === 'blaze_rod');
          if (rodItem) await chest.deposit(rodItem.type, null, rodItem.count);
          await chest.close();
          bot.chat(`Beta: Deposited ${rods} Blaze Rods into base chest! Milestone 8 100% COMPLETE!`);
        }
      } catch (e) {
        console.log('Chest deposit error:', e.message);
      }
    }
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  blaze_rods: lib.count('blaze_rod')
};
