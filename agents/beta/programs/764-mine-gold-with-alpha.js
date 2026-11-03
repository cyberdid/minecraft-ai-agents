// programs/764-mine-gold-with-alpha.js
console.log('=== Program 764: Mine Nether Gold Ore with Alpha ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Initial nuggets:', lib.count('gold_nugget'));

bot.clearControlStates();
bot.pathfinder.stop();
if (typeof configureFireAvoidance === 'function') configureFireAvoidance();

// Helper to safely clear fire
async function safeClearFire() {
  if (typeof globalThis.clearFireAhead === 'function') {
    await globalThis.clearFireAhead();
  }
}

// Check if crafting table exists in Nether within 32m
const existingTable = bot.findBlock({
  matching: b => b && b.name.includes('crafting_table'),
  maxDistance: 32
});
console.log('Crafting table in Nether:', existingTable ? lib.fmt(existingTable.position) : 'none found');

// Target gold ores
const targetOres = [
  new Vec3(32, 69, -26),
  new Vec3(31, 69, -26),
  new Vec3(41, 51, -21)
];

// Scan for all gold ore within 24m
const foundOres = bot.findBlocks({
  matching: b => b && b.name === 'nether_gold_ore',
  maxDistance: 24,
  count: 15
});
console.log(`Found ${foundOres.length} gold ores within 24m:`, foundOres.map(p => lib.fmt(p)).join(', '));

const allTargets = [...foundOres];
for (const t of targetOres) {
  if (!allTargets.some(p => p.equals(t))) allTargets.push(t);
}

// Equip stone pickaxe
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

let mined = 0;
for (const p of allTargets) {
  if (isCancelled()) break;
  // Skip blocks that are too far down (y < 60) to avoid lava falls
  if (p.y < 62) {
    console.log(`Skipping low ore at ${lib.fmt(p)} for safety (y < 62)`);
    continue;
  }

  console.log(`Navigating to mine gold ore at ${lib.fmt(p)}...`);
  await safeClearFire();

  try {
    await bot.pathfinder.goto(new goals.GoalNear(p.x, p.y, p.z, 2.2));
    const b = bot.blockAt(p);
    if (b && b.name === 'nether_gold_ore') {
      const curPick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
      if (curPick) await bot.equip(curPick, 'hand');
      await bot.dig(b);
      mined++;
      console.log(`Successfully mined gold ore at ${lib.fmt(p)}!`);
      await sleep(250);
      await lib.pickup(3.5);
    }
  } catch (err) {
    console.log(`Mine error at ${lib.fmt(p)}:`, err.message);
  }
}

await lib.pickup(5.0);
const finalNuggets = lib.count('gold_nugget');
console.log(`Mining round finished. Mined: ${mined} ores. Total nuggets: ${finalNuggets}`);
bot.chat(`Beta: Mining round done! Mined ${mined} gold ores. Holding ${finalNuggets} gold nuggets (${Math.floor(finalNuggets/9)} ingots)!`);

// Check for nearby Piglins
const piglins = Object.values(bot.entities).filter(e =>
  e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 24
);
console.log(`Found ${piglins.length} Piglins nearby.`);

// Check for nearby Endermen
const endermen = Object.values(bot.entities).filter(e =>
  e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 24
);
console.log(`Found ${endermen.length} Endermen nearby.`);

console.log('=== Final Status ===');
console.log('Position:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  mined,
  gold_nuggets: finalNuggets,
  gold_ingots: lib.count('gold_ingot'),
  crafting_table_nearby: !!existingTable,
  piglins: piglins.length,
  endermen: endermen.length,
  hp: bot.health,
  food: bot.food
};
