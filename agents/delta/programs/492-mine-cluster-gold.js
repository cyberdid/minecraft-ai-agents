// programs/492-mine-cluster-gold.js
console.log('Delta at y=77 ledge:', lib.fmt(bot.entity.position), 'HP:', bot.health);

const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
const ores = bot.findBlocks({
  matching: goldOreId,
  maxDistance: 16,
  count: 10
});

console.log(`Found ${ores.length} nether_gold_ore blocks within 16m:`, ores.map(p => lib.fmt(p)).join(', '));

const moves = new Movements(bot, mcData);
moves.canDig = true; // allow digging netherrack in front of ores
moves.allowParkour = true;
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) moves.blocksToAvoid.add(id);
if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
bot.pathfinder.setMovements(moves);

let mined = 0;
for (const orePos of ores) {
  console.log(`Approaching nether_gold_ore at ${lib.fmt(orePos)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(orePos.x, orePos.y, orePos.z, 2.0));
    const targetBlock = bot.blockAt(orePos);
    if (targetBlock && targetBlock.name === 'nether_gold_ore') {
      await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
      console.log(`Mining nether_gold_ore at ${lib.fmt(orePos)}...`);
      await bot.dig(targetBlock);
      mined++;
      await sleep(200);
      try { await lib.pickup(3.5); } catch (e) {}
    }
  } catch (e) {
    console.log(`Mining note at ${lib.fmt(orePos)}:`, e.message);
  }

  if (lib.count('gold_nugget') >= 36) break;
}

// Pickup drops
try { await lib.pickup(4); } catch (e) {}

const totalNuggets = lib.count('gold_nugget');
console.log(`Mining complete. Mined: ${mined}, Nuggets in inv: ${totalNuggets}`);

// Craft ingots from nuggets
if (totalNuggets >= 9) {
  const ingots = Math.floor(totalNuggets / 9);
  try {
    await lib.craft('gold_ingot', ingots);
    console.log(`Crafted ${ingots} gold_ingot! Total ingots: ${lib.count('gold_ingot')}`);
  } catch (e) {
    console.log('Craft ingot note:', e.message);
  }
}

// Craft golden_boots if 4+ ingots
if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
  try {
    await lib.craft('golden_boots', 1);
    console.log('Crafted golden_boots!');
    bot.chat('delta: Crafted golden_boots! 100% Piglin neutrality ACTIVE!');
    const gb = bot.inventory.items().find(it => it.name === 'golden_boots');
    if (gb) await bot.equip(gb, 'feet');
  } catch (e) {
    console.log('Craft boots note:', e.message);
  }
}

// Equip sword and shield
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

bot.chat(`delta: Gold mining complete! Mined ${mined} ores. Nuggets: ${lib.count('gold_nugget')}, Ingots: ${lib.count('gold_ingot')}, Boots: ${lib.count('golden_boots')}.`);

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
