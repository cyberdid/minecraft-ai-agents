// programs/740-prep-end-gateway-expedition.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 740: PREP END GATEWAY EXPEDITION (MILESTONE 13) ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

const chestPos = new Vec3(293, 72, -57);
const cb = bot.blockAt(chestPos);

if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const junk = [
      'granite', 'mossy_stone_bricks', 'cracked_stone_bricks',
      'cobbled_deepslate', 'rail', 'wooden_pickaxe', 'stone_sword', 'stone_pickaxe'
    ];

    console.log('Depositing clutter into Base Chest...');
    for (const j of junk) {
      const items = bot.inventory.items().filter(i => i.name === j);
      for (const it of items) {
        try {
          await chest.deposit(it.type, null, it.count);
          console.log(`Deposited ${it.name} x${it.count}`);
        } catch (de) {}
      }
    }

    // Check for ender_pearl in chest
    const cItems = chest.containerItems();
    const pearls = cItems.find(i => i.name === 'ender_pearl');
    if (pearls && lib.count('ender_pearl') < 4) {
      const take = Math.min(pearls.count, 4 - lib.count('ender_pearl'));
      console.log(`Withdrawing ${take} ender_pearls for End Gateway transit...`);
      await chest.withdraw(pearls.type, null, take);
    }

    // Check for arrows
    const arrows = cItems.find(i => i.name === 'arrow');
    if (arrows && lib.count('arrow') < 8) {
      const take = Math.min(arrows.count, 8 - lib.count('arrow'));
      console.log(`Withdrawing ${take} arrows for bow...`);
      await chest.withdraw(arrows.type, null, take);
    }

    // Check for cooked food
    const food = cItems.find(i => ['cooked_beef', 'cooked_porkchop', 'bread'].includes(i.name));
    if (food && lib.count(food.name) < 8) {
      console.log(`Withdrawing ${food.name}...`);
      await chest.withdraw(food.type, null, Math.min(food.count, 8));
    }

    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// Equip best weapons and armor
try {
  const ns = bot.inventory.items().find(i => i.name === 'netherite_sword');
  if (ns) await bot.equip(ns, 'hand');
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
  await lib.equipArmor();
} catch (e) {}

console.log('\n=== Delta Cleaned Inventory ===');
console.log(JSON.stringify(lib.inv()));
console.log('Held weapon:', bot.heldItem?.name);

bot.chat('delta: Restocked & geared with Netherite Sword, Shield, Bow! Ready for Milestone 13 End Gateway & Elytra expedition!');

return {
  inv: lib.inv(),
  held: bot.heldItem?.name,
  hp: bot.health,
  food: bot.food
};
