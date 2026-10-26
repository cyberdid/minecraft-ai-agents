// programs/498-stand-still-in-portal.js
console.log('=== Step: Stand Still in Nether Portal Block for Transit ===');
console.log('Current pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Locate nether_portal block
const pb = bot.findBlocks({
  matching: mcData.blocksByName.nether_portal.id,
  maxDistance: 10,
  count: 1
})[0];

if (!pb) {
  console.log('ERROR: No nether_portal block found within 10m!');
} else {
  console.log('Found nether_portal block at', lib.fmt(pb));
  
  // Navigate directly onto the portal block floor
  try {
    await lib.goTo(pb.x + 0.5, pb.y, pb.z + 0.5, 0.3);
  } catch (e) {
    console.log('goTo error, walking manually:', e.message);
    await bot.lookAt(new Vec3(pb.x + 0.5, pb.y + 1, pb.z + 0.5), true);
    bot.setControlState('forward', true);
    bot.setControlState('jump', true);
    await sleep(600);
    bot.setControlState('jump', false);
    await sleep(600);
    bot.clearControlStates();
  }

  // Clear all controls to stand completely still
  bot.clearControlStates();
  console.log('Standing inside portal block at:', lib.fmt(bot.entity.position));

  // 2. Wait up to 14s for Nether transit (takes 80 ticks = 4s in survival)
  for (let s = 0; s < 14; s++) {
    await sleep(1000);
    if (isCancelled()) break;
    if (bot.game.dimension === 'the_nether' || bot.game.dimension === 'minecraft:the_nether') {
      console.log(`SUCCESS: ENTERED THE NETHER at second ${s+1}! Pos:`, lib.fmt(bot.entity.position));
      break;
    }
  }
}

console.log('Dimension now:', bot.game.dimension, 'Pos:', lib.fmt(bot.entity.position));
bot.chat(`beta: Dimension is ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}!`);
