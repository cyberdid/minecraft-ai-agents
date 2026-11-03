// programs/493-pickup-and-finish-gold.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = true;
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) moves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

// 1. Move into ore vein at (42.5, 76.0, -50.5)
try {
  await bot.pathfinder.goto(new goals.GoalNear(42.5, 76.0, -50.5, 1.5));
  console.log('Reached ore vein center! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Vein approach note:', e.message);
}

// 2. Pickup any dropped nuggets from earlier mining
try { await lib.pickup(4.0); } catch (e) {}

// 3. Find and mine all adjacent nether_gold_ore blocks
const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
const ores = bot.findBlocks({
  matching: goldOreId,
  maxDistance: 8,
  count: 10
});

console.log(`Found ${ores.length} nether_gold_ore blocks within 8m:`, ores.map(p => lib.fmt(p)).join(', '));

let mined = 0;
for (const p of ores) {
  const b = bot.blockAt(p);
  if (b && b.name === 'nether_gold_ore') {
    try {
      await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
      console.log(`Mining nether_gold_ore at ${lib.fmt(p)}...`);
      await bot.dig(b);
      mined++;
      await sleep(200);
      try { await lib.pickup(3.0); } catch (e) {}
    } catch (e) {
      console.log(`Dig error at ${lib.fmt(p)}:`, e.message);
    }
  }
}

// 4. Pickup all nuggets
try { await lib.pickup(4.0); } catch (e) {}

const nuggets = lib.count('gold_nugget');
console.log(`Nuggets in inventory: ${nuggets}`);

// 5. Craft ingots and golden_boots
if (nuggets >= 9) {
  const ingots = Math.floor(nuggets / 9);
  try {
    await lib.craft('gold_ingot', ingots);
    console.log(`Crafted ${ingots} gold_ingot! Total: ${lib.count('gold_ingot')}`);
  } catch (e) {
    console.log('Craft ingot note:', e.message);
  }
}

if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
  try {
    await lib.craft('golden_boots', 1);
    console.log('Crafted golden_boots!');
    const gb = bot.inventory.items().find(it => it.name === 'golden_boots');
    if (gb) {
      await bot.equip(gb, 'feet');
      bot.chat('delta: Crafted & equipped golden_boots! 100% Piglin neutrality ACTIVE!');
    }
  } catch (e) {
    console.log('Craft boots note:', e.message);
  }
}

// Re-equip weapon & shield
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

bot.chat(`delta: Gold mining round done! Mined: ${mined} ores. Nuggets: ${lib.count('gold_nugget')}, Ingots: ${lib.count('gold_ingot')}, Boots: ${lib.count('golden_boots')}.`);

return {
  pos: bot.entity.position,
  mined,
  nuggets: lib.count('gold_nugget'),
  ingots: lib.count('gold_ingot'),
  boots: lib.count('golden_boots'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
