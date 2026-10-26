// programs/037-return-through-portal.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dimension:', bot.game.dimension);

// Find nether_portal block
const portals = bot.findBlocks({ matching: b => b.name === 'nether_portal', maxDistance: 8, count: 5 });
console.log(`Found ${portals.length} portal blocks`);

if (portals.length > 0) {
  const p = portals[0];
  console.log(`Walking into portal at ${lib.fmt(p)}...`);
  await bot.pathfinder.goto(new goals.GoalBlock(p.x, p.y, p.z));
  console.log('Inside portal, waiting for teleport...');
  await sleep(6000);
}

console.log('Pos after:', lib.fmt(bot.entity.position), 'dimension:', bot.game.dimension);
bot.chat(`delta: Portal transit complete! Now in ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}.`);
