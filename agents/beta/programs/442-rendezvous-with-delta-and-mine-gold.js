// programs/442-rendezvous-with-delta-and-mine-gold.js
console.log('=== Step: Rendezvous with Delta, get pickaxe, mine gold for golden_boots ===');
console.log('Pos in bunker:', lib.fmt(bot.entity.position));

// 1. Wait for Delta to materialize or check for drops
for (let i = 0; i < 10; i++) {
  const delta = bot.players['delta']?.entity;
  if (delta) {
    console.log(`Delta arrived at ${lib.fmt(delta.position)}!`);
    bot.chat('beta: Delta, toss 1 spare wooden pickaxe so Beta can mine gold for golden boots!');
    break;
  }
  await sleep(1000);
  if (isCancelled()) break;
}

// 2. Pick up any drops in bunker
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8
);
for (const d of drops) {
  try {
    await lib.goTo(d.position.x, d.position.y, d.position.z, 0.8);
    console.log(`Picked up drop at ${lib.fmt(d.position)}`);
  } catch (e) {}
}

console.log('Beta inventory:', JSON.stringify(lib.inv()));

// 3. If Beta has any pickaxe (wooden, stone, iron), mine gold ore at (64, 60, -3)
const hasPick = bot.inventory.items().some(i => i.name.endsWith('_pickaxe'));
if (hasPick) {
  console.log('Pickaxe confirmed! Moving to East gold vein (64, 60, -3)...');
  const goldOres = bot.findBlocks({
    matching: b => b.name === 'nether_gold_ore',
    maxDistance: 25,
    count: 8
  });
  console.log(`Gold ores spotted: ${goldOres.length}`);
  for (const gp of goldOres) {
    if (isCancelled() || lib.count('gold_nugget') >= 36) break;
    try {
      const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
      if (pick) await bot.equip(pick, 'hand');
      await lib.goTo(gp.x, gp.y, gp.z, 2);
      await lib.dig(gp.x, gp.y, gp.z);
      console.log(`Mined gold ore at ${lib.fmt(gp)}! Nuggets: ${lib.count('gold_nugget')}`);
    } catch (e) {}
  }

  // Collect nugget drops
  const nugDrops = Object.values(bot.entities).filter(e => 
    e.name === 'item' && bot.entity.position.distanceTo(e.position) < 8
  );
  for (const d of nugDrops) {
    try {
      await lib.goTo(d.position.x, d.position.y, d.position.z, 0.8);
    } catch (e) {}
  }
}

// 4. Craft gold ingots and golden_boots if 36 nuggets
if (lib.count('gold_nugget') >= 36) {
  const ingotRecipe = bot.recipesFor(mcData.itemsByName.gold_ingot.id, null, 1, null)[0];
  if (ingotRecipe) {
    await bot.craft(ingotRecipe, 4, null);
    console.log(`Crafted 4 gold ingots!`);
  }

  const tableBlock = bot.blockAt(new Vec3(39, 65, -7)) || bot.findBlocks({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 10, count: 1 })[0];
  if (tableBlock && lib.count('gold_ingot') >= 4) {
    const tb = bot.blockAt(tableBlock);
    const bootRecipe = bot.recipesFor(mcData.itemsByName.golden_boots.id, null, 1, tb)[0];
    if (bootRecipe) {
      await bot.craft(bootRecipe, 1, tb);
      console.log('Crafted golden_boots!');
      await lib.equipArmor();
    }
  }
}

console.log(`Status: nuggets=${lib.count('gold_nugget')}, gold_ingot=${lib.count('gold_ingot')}, boots=${lib.count('golden_boots')}`);
bot.chat(`beta: Golden boots status: boots=${lib.count('golden_boots')}, nuggets=${lib.count('gold_nugget')}. Ready to neutralize Piglins and advance!`);
