// programs/084-complete-gold-boots-and-join-fortress.js
console.log('--- COMPLETE GOLDEN BOOTS & JOIN FORTRESS ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Gold nuggets:', lib.count('gold_nugget'));

// 1. Mine 1-2 more gold ore nearby if nuggets < 36
if (lib.count('gold_nugget') < 36) {
  const nearbyGold = bot.findBlocks({
    matching: b => b && b.name === 'nether_gold_ore',
    maxDistance: 8,
    count: 3
  });
  console.log(`Found ${nearbyGold.length} gold ores within 8m`);
  await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
  for (const gp of nearbyGold) {
    if (lib.count('gold_nugget') >= 36) break;
    try {
      console.log(`Digging gold ore at ${lib.fmt(gp)}...`);
      await lib.dig(gp.x, gp.y, gp.z);
      await sleep(200);
      await lib.pickup(4);
    } catch (e) {
      console.log('Dig note:', e.message);
    }
  }
}

console.log('Total gold nuggets:', lib.count('gold_nugget'));

// 2. Head to bunker table or ensure crafting table
if (lib.count('gold_nugget') >= 36) {
  console.log('Heading to bunker crafting table (38, 65, -9)...');
  try {
    await lib.goTo(38, 65, -9, 2, { timeoutMs: 20000 });
  } catch (e) {
    console.log('Table move note:', e.message);
    await lib.ensureTable();
  }

  console.log('Crafting 4 gold ingots...');
  await lib.craft('gold_ingot', 4);
  console.log('Crafting golden_boots...');
  await lib.craft('golden_boots', 1);
  await lib.equipArmor();
  console.log('GOLDEN BOOTS EQUIPPED! Piglins are 100% neutral!');
  bot.chat('gamma EQUIPPED GOLDEN BOOTS! Piglins are neutral. Rushing to Fortress Workshop (44, 65, -129)!');
} else {
  bot.chat(`gamma has ${lib.count('gold_nugget')} gold nuggets. Moving to join team at Fortress Workshop (44, 65, -129)!`);
}

// 3. Advance to Fortress Workshop (44, 65, -129)
console.log('Advancing along ridge trail to Fortress Workshop...');
try {
  console.log('Moving to trail waypoint (56, 64, -66)...');
  await lib.goTo(56, 64, -66, 3, { timeoutMs: 25000 });
} catch (e) {
  console.log('Trail WP note:', e.message);
}

try {
  console.log('Moving to Fortress entrance (51, 65, -116)...');
  await lib.goTo(51, 65, -116, 3, { timeoutMs: 30000 });
} catch (e) {
  console.log('Entrance note:', e.message);
}

try {
  console.log('Entering Fortress Workshop at (44, 65, -129)...');
  await lib.goTo(44, 65, -129, 2, { timeoutMs: 30000 });
  console.log('ARRIVED AT FORTRESS WORKSHOP!');
} catch (e) {
  console.log('Workshop arrival note:', e.message);
}

// 4. Report status & team
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}`);
  }
}

console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);
bot.chat(`gamma at Fortress Workshop ${lib.fmt(bot.entity.position)} with team! Ready to farm Blaze Rods.`);
