// programs/792-inspect-valley-position.js
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

const pos = bot.entity.position;
const under = bot.blockAt(pos.offset(0, -1, 0));
console.log(`Standing on: ${under ? under.name : 'null'} at ${lib.fmt(pos.offset(0, -1, 0))}`);

// Scan 5x5 around
for (let dx = -2; dx <= 2; dx++) {
  for (let dz = -2; dz <= 2; dz++) {
    const b = bot.blockAt(pos.offset(dx, -1, dz));
    const bHead = bot.blockAt(pos.offset(dx, 0, dz));
    if (b && (b.name === 'lava' || b.name === 'fire' || b.name === 'soul_fire')) {
      console.log(`DANGER: ${b.name} at dx=${dx}, dz=${dz} (${lib.fmt(b.position)})`);
    }
  }
}

// Check fortress pillars or structure nearby
const netherBricks = bot.findBlocks({ matching: b => b && b.name.includes('nether_brick'), maxDistance: 24, count: 10 });
console.log(`Nether brick blocks nearby: ${netherBricks.length}`);
if (netherBricks.length > 0) {
  console.log(`Closest nether brick: ${lib.fmt(netherBricks[0])}`);
}

// Check path or way up to (44, 65, -127)
console.log(`Distance to Bunker (44, 65, -127): ${pos.distanceTo(new Vec3(44, 65, -127)).toFixed(1)}m (dy = ${(65 - pos.y).toFixed(1)})`);

return {
  pos: bot.entity.position,
  standingOn: under ? under.name : 'null',
  hp: bot.health,
  food: bot.food,
  cobble: lib.count('cobblestone')
};
