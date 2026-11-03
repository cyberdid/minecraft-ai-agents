// programs/644-scout-gold-and-climb.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 644: SCOUT GOLD ORE, CLIMB & MINE ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Maintain golden boots on feet and shield in offhand
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

// 2. Scan for nether_gold_ore in 48m radius
const oreBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gilded_blackstone' || b.name === 'gold_block'),
  maxDistance: 48,
  count: 40
});

console.log(`Found ${oreBlocks.length} gold ore/block candidates:`);
for (const p of oreBlocks) {
  const b = bot.blockAt(p);
  console.log(`  ${b.name} at ${lib.fmt(p)} (dist: ${bot.entity.position.distanceTo(p).toFixed(1)}m)`);
}

// 3. Scan ground items at y >= 65
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.isValid && e.position.distanceTo(bot.entity.position) <= 12);
console.log(`Ground items within 12m: ${items.length}`);
for (const it of items) {
  console.log(`  Item at ${lib.fmt(it.position)}, dist: ${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
}

// 4. Check players
const players = Object.values(bot.entities).filter(e => e.type === 'player' && e !== bot.entity);
for (const p of players) {
  console.log(`Player: ${p.username} at ${lib.fmt(p.position)}`);
}

// 5. Check access to y=67 ledge (Beta position)
console.log('Checking path to Beta / upper ledge at (43, 67, -117)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(43, 67, -117, 1.2));
  console.log('Successfully reached upper ledge! New pos:', lib.fmt(bot.entity.position));
  await lib.pickup(4.0);
} catch (e) {
  console.log('Direct pathfind to upper ledge failed:', e.message);
}

// 6. Mine reachable gold ore if found
if (oreBlocks.length > 0) {
  console.log('Attempting to mine closest gold ore block...');
  // Sort by distance
  oreBlocks.sort((a, b) => bot.entity.position.distanceTo(a) - bot.entity.position.distanceTo(b));
  
  let minedCount = 0;
  for (const orePos of oreBlocks) {
    if (isCancelled()) break;
    const block = bot.blockAt(orePos);
    if (!block || (block.name !== 'nether_gold_ore' && block.name !== 'gilded_blackstone')) continue;
    
    // Check if safe to pathfind to (avoid dropping into lava)
    if (orePos.y < 55) {
      console.log(`Skipping ore at ${lib.fmt(orePos)}: below y=55 (lava danger)`);
      continue;
    }
    
    console.log(`Targeting ore at ${lib.fmt(orePos)}...`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(orePos.x, orePos.y, orePos.z, 2.5));
      // Equip pickaxe
      const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
      if (pick) await bot.equip(pick, 'hand');
      await bot.lookAt(orePos.offset(0.5, 0.5, 0.5), true);
      await bot.dig(bot.blockAt(orePos));
      minedCount++;
      console.log(`Mined ore at ${lib.fmt(orePos)}! Total mined: ${minedCount}`);
      await sleep(300);
      await lib.pickup(4.0);
    } catch (err) {
      console.log(`Could not mine ore at ${lib.fmt(orePos)}:`, err.message);
    }
    
    if (minedCount >= 8) break; // Mine in batches
  }
  
  console.log(`Mining batch complete. Gold nuggets: ${lib.count('gold_nugget')}, Gold ingots: ${lib.count('gold_ingot')}`);
}

// 7. Craft nuggets into ingots if we have 9+ nuggets
const nuggets = lib.count('gold_nugget');
if (nuggets >= 9) {
  console.log(`Crafting gold ingots from ${nuggets} nuggets...`);
  try {
    const table = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 16 });
    if (table) {
      await bot.pathfinder.goto(new goals.GoalNear(table.position.x, table.position.y, table.position.z, 2));
    }
    await lib.craft('gold_ingot', Math.floor(nuggets / 9));
    console.log(`Crafted gold ingots! Total now: ${lib.count('gold_ingot')}`);
  } catch (ce) {
    console.log('Craft gold ingots failed:', ce.message);
  }
}

// Re-equip weapons/armor
try { await lib.equipWeapon(); } catch (e) {}

return {
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position,
  oresFound: oreBlocks.length,
  nuggets: lib.count('gold_nugget'),
  ingots: lib.count('gold_ingot'),
  pearls: lib.count('ender_pearl'),
  inv: lib.inv()
};
