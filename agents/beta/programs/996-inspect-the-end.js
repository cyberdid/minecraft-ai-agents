console.log('=== Program 996: Inspect The End & Locate Dragon/Crystals ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);

// Check block under feet
const under = bot.blockAt(bot.entity.position.offset(0, -1, 0));
console.log(`Block under feet: ${under?.name} at ${lib.fmt(under?.position)}`);

// Look for Ender Dragon
const dragon = Object.values(bot.entities).find(e => e.name === 'ender_dragon');
if (dragon) {
  console.log(`ENDER DRAGON FOUND! Pos: ${lib.fmt(dragon.position)}, HP: ${dragon.health || 'unknown'}`);
} else {
  console.log('Ender Dragon not in visual range or entity list.');
}

// Look for End Crystals
const crystals = Object.values(bot.entities).filter(e => e.name === 'end_crystal');
console.log(`Found ${crystals.length} End Crystals within entity range:`);
for (const c of crystals) {
  console.log(`  - Crystal at ${lib.fmt(c.position)} (dist: ${bot.entity.position.distanceTo(c.position).toFixed(1)}m)`);
}

// Look for teammates
for (const name of ['alpha', 'gamma', 'delta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  }
}

// Check nearby obsidian or end_stone blocks to understand terrain
const endStone = bot.findBlocks({
  matching: b => b && (b.name === 'end_stone' || b.name === 'obsidian'),
  maxDistance: 32,
  count: 20
});

console.log(`Found ${endStone.length} end_stone/obsidian blocks nearby.`);

// Check direction to (0, 65, 0) - Center of The End
const center = new Vec3(0, 65, 0);
const distToCenter = bot.entity.position.distanceTo(center);
console.log(`Distance to Island Center (0, 65, 0): ${distToCenter.toFixed(1)}m`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  dragon: !!dragon,
  crystals: crystals.length,
  hp: bot.health,
  food: bot.food
};
