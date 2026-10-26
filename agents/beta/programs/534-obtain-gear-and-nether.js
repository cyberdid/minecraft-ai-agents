// programs/534-obtain-gear-and-nether.js
console.log('=== Step: Obtain Gear & Transit to Nether ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Check base chests for tools or materials
const chests = bot.findBlocks({ matching: mcData.blocksByName.chest.id, maxDistance: 6, count: 5 });
for (const cp of chests) {
  try {
    const cBlock = bot.blockAt(cp);
    const chest = await bot.openChest(cBlock);
    const items = chest.items();
    console.log(`Chest at ${lib.fmt(cp)}:`, items.map(i => `${i.name}x${i.count}`).join(', ') || 'empty');
    for (const it of items) {
      if (['stone_pickaxe', 'iron_pickaxe', 'stone_sword', 'iron_sword', 'shield', 'cobblestone', 'cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread'].includes(it.name)) {
        console.log(`Withdrawing ${it.name}x${it.count}...`);
        try { await chest.withdraw(it.type, null, it.count); } catch (e) {}
      }
    }
    await chest.close();
  } catch (e) {}
}

// 2. Obtain stone_pickaxe if missing
if (!bot.inventory.items().some(i => i.name.endsWith('_pickaxe'))) {
  console.log('Obtaining stone_pickaxe via lib.obtain...');
  try {
    await lib.obtain('stone_pickaxe', 1);
    console.log('SUCCESS: Obtained stone_pickaxe!');
  } catch (err) {
    console.log('lib.obtain stone_pickaxe error:', err.message);
  }
}

// 3. Obtain stone_sword if missing
if (!bot.inventory.items().some(i => i.name.endsWith('_sword'))) {
  console.log('Obtaining stone_sword via lib.obtain...');
  try {
    await lib.obtain('stone_sword', 1);
    console.log('SUCCESS: Obtained stone_sword!');
  } catch (err) {
    console.log('lib.obtain stone_sword error:', err.message);
  }
}

// 4. Ensure at least 16 cobblestone
const cobble = bot.inventory.count(mcData.itemsByName.cobblestone?.id || 0);
console.log(`Cobblestone count: ${cobble}`);
if (cobble < 16) {
  console.log('Obtaining cobblestone via lib.obtain...');
  try {
    await lib.obtain('cobblestone', 16);
    console.log('SUCCESS: Obtained 16 cobblestone!');
  } catch (err) {
    console.log('lib.obtain cobble error:', err.message);
  }
}

// Equip best weapons
await lib.equipArmor();
await lib.equipWeapon();

const inv = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log('Inventory before Nether portal:', inv);

// 5. Navigate to Nether Portal at (298, 73, -54)
const portalPos = new Vec3(298, 73, -54);
console.log(`Heading to Nether Portal at ${lib.fmt(portalPos)}...`);

try {
  await lib.goTo(portalPos.x, portalPos.y, portalPos.z, 1, { dig: true });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(portalPos.x, portalPos.y, portalPos.z, 1)); } catch (e2) {}
}

// 6. Step into nether_portal block
const portals = bot.findBlocks({
  matching: b => b.name === 'nether_portal',
  maxDistance: 8,
  count: 5
});

if (portals.length > 0) {
  const p = portals[0];
  console.log(`Stepping into nether_portal block at ${lib.fmt(p)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(p.x, p.y, p.z));
  } catch (e) {
    await bot.lookAt(new Vec3(p.x + 0.5, p.y + 0.5, p.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(600);
    bot.clearControlStates();
  }
}

bot.clearControlStates();
console.log('Standing completely still inside portal at:', lib.fmt(bot.entity.position));

// 7. Wait for dimension warp (80 ticks = 4.0s)
const startDim = bot.game.dimension;
for (let s = 0; s < 10; s++) {
  await sleep(1000);
  if (isCancelled()) break;
  if (bot.game.dimension !== startDim) {
    console.log(`SUCCESS: ENTERED THE NETHER! Pos: ${lib.fmt(bot.entity.position)}`);
    break;
  }
}

console.log('Final Pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension, 'HP:', bot.health);
bot.chat(`beta: Geared (${inv}) and entering Nether to join mountain breach!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  inventory: inv
};
