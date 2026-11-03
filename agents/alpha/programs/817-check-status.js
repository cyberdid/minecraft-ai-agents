// programs/817-check-status.js
console.log('=== Status Check ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Check armor
const armor = bot.inventory.slots.slice(5, 9).map(i => i ? i.name : 'empty');
console.log('Alpha armor [helm, chest, legs, boots]:', JSON.stringify(armor));

// Check nearby players
for (const [name, p] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  const pos = p.entity ? lib.fmt(p.entity.position) : 'unknown/far';
  const ping = p.ping;
  console.log(`Teammate ${name}: pos=${pos}, ping=${ping}`);
}

// Check nearby blocks around bot (y-1 to y+2)
const pos = bot.entity.position;
const bx = Math.floor(pos.x);
const by = Math.floor(pos.y);
const bz = Math.floor(pos.z);
console.log(`Standing at (${bx}, ${by}, ${bz}) on block:`, bot.blockAt(new Vec3(bx, by - 1, bz))?.name);

// Check nearby fire/lava
const dangerous = bot.findBlocks({
  matching: b => b && (b.name.includes('fire') || b.name.includes('lava')),
  maxDistance: 10,
  count: 5
});
console.log('Nearby fire/lava count:', dangerous.length);
if (dangerous.length > 0) {
  console.log('Closest danger:', dangerous[0], bot.blockAt(dangerous[0])?.name);
}

return {
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position,
  dim: bot.game.dimension,
  armor
};
