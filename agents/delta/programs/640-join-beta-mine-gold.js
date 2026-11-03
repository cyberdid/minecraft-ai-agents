console.log('=== DELTA: JOIN BETA AT GOLD VEIN ===');
console.log(`Delta pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

// Pathfind along corridor to Beta at (44, 67, -116)
try {
  await bot.pathfinder.goto(new goals.GoalNear(44.0, 67.0, -118.0, 1.5));
} catch (e) {
  console.log('Goto Beta note:', e.message);
}

console.log('Arrived near Beta! Pos:', lib.fmt(bot.entity.position));

// Check nearby gold ores within 12m
const goldOres = bot.findBlocks({
  matching: b => b && (b.name === 'nether_gold_ore' || b.name === 'gold_ore'),
  maxDistance: 12,
  count: 8
});
console.log(`Found ${goldOres.length} gold ores:`, goldOres.map(p => lib.fmt(p)));

// Mine reachable gold ores with iron_pickaxe
for (const gp of goldOres) {
  if (isCancelled()) break;
  console.log(`Mining gold ore at ${lib.fmt(gp)}...`);
  try {
    await lib.dig(gp.x, gp.y, gp.z);
    await sleep(250);
    await lib.pickup(3.5);
  } catch (err) {
    console.log('Dig note:', err.message);
  }
}

console.log(`Delta inventory: nuggets = ${lib.count('gold_nugget')}, ingots = ${lib.count('gold_ingot')}`);

// If we have nuggets >= 9, craft ingots
if (lib.count('gold_nugget') >= 9) {
  try {
    const table = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 16 });
    if (table) {
      await lib.craft('gold_ingot', Math.floor(lib.count('gold_nugget') / 9));
      console.log(`Crafted ingots! Total ingots: ${lib.count('gold_ingot')}`);
    }
  } catch (e) {
    console.log('Craft ingots note:', e.message);
  }
}

bot.chat(`delta: United with Beta at ${lib.fmt(bot.entity.position)}! Gold nuggets: ${lib.count('gold_nugget')}, ingots: ${lib.count('gold_ingot')}. Advancing Milestone 9!`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  nuggets: lib.count('gold_nugget'),
  ingots: lib.count('gold_ingot')
};
