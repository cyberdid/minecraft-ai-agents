// programs/420-step-into-portal-block.js
console.log('=== Program 420: Step Exactly Into Nether Portal Block ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Scan for active nether_portal blocks nearby
const portalBlocks = bot.findBlocks({
  matching: b => b.name === 'nether_portal',
  maxDistance: 8,
  count: 10
});

console.log(`Found ${portalBlocks.length} nether_portal block(s) nearby:`);
for (const p of portalBlocks) {
  console.log(`- nether_portal at ${lib.fmt(p)}`);
}

if (portalBlocks.length === 0) {
  console.log('Error: No nether_portal blocks found within 8m! Scanning obsidian frame...');
  const obs = bot.findBlocks({ matching: b => b.name === 'obsidian', maxDistance: 8, count: 14 });
  for (const o of obs) console.log(`- obsidian at ${lib.fmt(o)}`);
} else {
  // 2. Pick the lowest nether_portal block
  portalBlocks.sort((a, b) => a.y - b.y);
  const target = portalBlocks[0];
  const center = new Vec3(target.x + 0.5, target.y, target.z + 0.5);
  console.log(`Moving directly into nether_portal center at ${lib.fmt(center)}...`);
  
  // Look directly at portal center and walk in
  await bot.lookAt(center, true);
  bot.setControlState('forward', true);
  const moveStart = Date.now();
  while (Date.now() - moveStart < 2500) {
    if (bot.entity.position.distanceTo(center) < 0.6) break;
    await sleep(100);
  }
  bot.setControlState('forward', false);
  console.log('Current pos inside/near portal:', lib.fmt(bot.entity.position));
  
  // 3. Stand stationary inside portal block for dimension transit (requires 80 ticks = 4.0s)
  console.log('Standing completely still inside nether_portal block...');
  for (let wait = 0; wait < 35; wait++) {
    if (bot.game.dimension === 'the_nether') {
      console.log('*** TRANSIT SUCCESSFUL! DIMENSION IS THE_NETHER! ***');
      break;
    }
    await sleep(500);
  }
}

console.log('Final Dimension:', bot.game.dimension);
console.log('Alpha final pos:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'the_nether') {
  bot.chat(`team: Alpha entered the Nether! Pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}, Food=${bot.food}, Cobble=${lib.count('cobblestone')}. Moving along East Ridge to Fortress (44, 65, -133)!`);
}

console.log('Alpha status:', JSON.stringify(lib.status()));
console.log('Alpha inventory:', JSON.stringify(lib.inv()));
