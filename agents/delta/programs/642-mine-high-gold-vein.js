console.log('=== DELTA: MINE HIGH GOLD VEIN (38, 75, -113) ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

// Configure pathfinder with canDig = true so we can staircase up to vein
const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = false;
bot.pathfinder.setMovements(moves);

const veinTarget = new Vec3(38, 75, -113);
console.log(`Pathfinding up to gold vein at ${lib.fmt(veinTarget)}...`);

try {
  await bot.pathfinder.goto(new goals.GoalNear(veinTarget.x, veinTarget.y, veinTarget.z, 2.5));
} catch (e) {
  console.log('Direct pathfinder failed, carving stepped approach...');
  try {
    await lib.goTo(veinTarget.x, veinTarget.y, veinTarget.z, 2.5, { dig: true, timeoutMs: 30000 });
  } catch (e2) {
    console.log('lib.goTo note:', e2.message);
  }
}

console.log(`Pos near vein: ${lib.fmt(bot.entity.position)}`);

// Mine gold ores within 5 blocks
const ores = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_ore'),
  maxDistance: 6,
  count: 10
});

console.log(`Found ${ores.length} gold ores within reach:`);
for (const op of ores) {
  if (isCancelled()) break;
  console.log(`Mining gold ore at ${lib.fmt(op)} with iron_pickaxe...`);
  try {
    await lib.dig(op.x, op.y, op.z);
    await sleep(250);
    await lib.pickup(3.5);
  } catch (err) {
    console.log('Dig error:', err.message);
  }
}

try { await lib.pickup(4.0); } catch (e) {}

console.log(`Delta gathered: nuggets = ${lib.count('gold_nugget')}, ingots = ${lib.count('gold_ingot')}`);

// Return safely down to bunker crafting table (44, 65, -134)
console.log('Returning down staircase to bunker crafting table...');
const tablePos = new Vec3(44, 65, -134);
try {
  await bot.pathfinder.goto(new goals.GoalNear(tablePos.x, tablePos.y, tablePos.z, 1.5));
} catch (e) {
  try { await lib.goTo(tablePos.x, tablePos.y, tablePos.z, 2, { dig: true, timeoutMs: 20000 }); } catch (e2) {}
}

console.log(`Pos at bunker table: ${lib.fmt(bot.entity.position)}`);

// Craft ingots from nuggets
if (lib.count('gold_nugget') >= 9) {
  try {
    await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
    console.log(`Ingots crafted! Total ingots: ${lib.count('gold_ingot')}`);
  } catch (e) {
    console.log('Craft ingot note:', e.message);
  }
}

// Craft golden_boots if >= 4 ingots
if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
  try {
    await lib.craft('golden_boots', 1);
    await lib.equipArmor();
    bot.chat('delta: Crafted and equipped golden_boots! 100% Piglin neutrality ACTIVE for Milestone 9!');
  } catch (e) {
    console.log('Craft boots note:', e.message);
  }
}

bot.chat(`delta: Gold mining complete! Nuggets: ${lib.count('gold_nugget')}, Ingots: ${lib.count('gold_ingot')}, Golden boots: ${lib.count('golden_boots')}.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  nuggets: lib.count('gold_nugget'),
  ingots: lib.count('gold_ingot'),
  boots: lib.count('golden_boots')
};
