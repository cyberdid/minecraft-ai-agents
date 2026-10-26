// programs/496-exact-portal-block.js
console.log('=== Step: Find Exact Nether Portal Block & Step In ===');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Scan for nether_portal blocks
const portals = bot.findBlocks({
  matching: mcData.blocksByName.nether_portal.id,
  maxDistance: 6,
  count: 6
});
console.log(`Found ${portals.length} active nether_portal blocks!`);
for (const p of portals) console.log(`  Portal block at ${lib.fmt(p)}`);

if (portals.length > 0) {
  const target = portals[0];
  console.log(`Walking into center of nether_portal block at ${lib.fmt(target)}...`);
  
  // Look directly at target and step into it
  await bot.lookAt(target.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.clearControlStates();
  
  console.log('Now standing at', lib.fmt(bot.entity.position));
  
  // Wait for Nether transit (up to 12s)
  for (let i = 0; i < 12; i++) {
    await sleep(1000);
    if (isCancelled()) break;
    if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
      console.log('SUCCESS: TRANSITED TO THE NETHER!');
      break;
    }
  }
}

console.log('Current dim:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
bot.chat(`beta: Transit result: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}`);
