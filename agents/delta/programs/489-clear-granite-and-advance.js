// programs/489-clear-granite-and-advance.js
console.log('Delta at:', lib.fmt(bot.entity.position));

// 1. Dig the granite blocks at (63, 65, -8) and (63, 66, -8)
for (const y of [66, 65]) {
  const b = bot.blockAt(new Vec3(63, y, -8));
  if (b && b.name !== 'air') {
    console.log(`Digging obstacle ${b.name} at (63, ${y}, -8)...`);
    await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
    await bot.dig(b);
    await sleep(200);
  }
}

// 2. Step forward through the cleared doorway to (63, 65, -12)
console.log('Stepping through cleared path to (63, 65, -12)...');
bot.clearControlStates();
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = false;
const fireIds = [mcData.blocksByName.fire?.id, mcData.blocksByName.soul_fire?.id].filter(Boolean);
for (const id of fireIds) moves.blocksToAvoid.add(id);
bot.pathfinder.setMovements(moves);

try {
  await bot.pathfinder.goto(new goals.GoalNear(63, 65, -12, 1.0));
  console.log('Successfully reached (63, 65, -12)!');
} catch (e) {
  console.log('Goto note:', e.message);
}

// 3. Walk to (63, 65, -20)
try {
  await bot.pathfinder.goto(new goals.GoalNear(63, 65, -20, 1.0));
  console.log('Successfully reached (63, 65, -20)! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Goto z=-20 note:', e.message);
}

// 4. Scan for nether_gold_ore from (63, 65, -20)
const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
if (goldOreId) {
  const ores = bot.findBlocks({
    matching: goldOreId,
    maxDistance: 16,
    count: 15
  }).map(p => bot.blockAt(p))
    .filter(b => b && b.position.y >= 63);

  console.log(`Found ${ores.length} safe nether_gold_ore blocks near (63, 65, -20)!`);
  for (const b of ores) {
    const op = b.position;
    console.log(`- ore at ${lib.fmt(op)}`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(op.x, op.y, op.z, 2.5));
      const targetBlock = bot.blockAt(op);
      if (targetBlock && targetBlock.name === 'nether_gold_ore') {
        await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
        console.log(`Mining ore at ${lib.fmt(op)}...`);
        await bot.dig(targetBlock);
        await sleep(200);
        try { await lib.pickup(3.5); } catch (e) {}
      }
    } catch (e2) {}

    if (lib.count('gold_nugget') >= 36) break;
  }
}

// 5. Pickup remaining drops
try { await lib.pickup(4); } catch (e) {}

// Craft ingots and boots
if (lib.count('gold_nugget') >= 9) {
  const ingots = Math.floor(lib.count('gold_nugget') / 9);
  try { await lib.craft('gold_ingot', ingots); } catch (e) {}
}

if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
  try {
    await lib.craft('golden_boots', 1);
    const gb = bot.inventory.items().find(it => it.name === 'golden_boots');
    if (gb) {
      await bot.equip(gb, 'feet');
      bot.chat('delta: Crafted & equipped golden_boots! 100% Piglin neutrality ACTIVE!');
    }
  } catch (e) {}
}

// Re-equip sword and shield
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

bot.chat(`delta: Cleared East Ridge granite door! Gold nuggets: ${lib.count('gold_nugget')}, Ingots: ${lib.count('gold_ingot')}, Boots: ${lib.count('golden_boots')}.`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  nuggets: lib.count('gold_nugget'),
  ingots: lib.count('gold_ingot'),
  boots: lib.count('golden_boots'),
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
