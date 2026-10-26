// programs/091-enter-nether-and-join-team.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Locate nether_portal blocks
const portals = bot.findBlocks({ matching: b => b.name === 'nether_portal', maxDistance: 16, count: 10 });
console.log(`Found ${portals.length} portal blocks:`, JSON.stringify(portals.map(p => lib.fmt(p))));

if (portals.length === 0) {
  throw new Error('No portal blocks found within 16 blocks!');
}

const targetPortal = portals[0];
console.log('Target portal block:', lib.fmt(targetPortal));

// Walk directly towards targetPortal
await bot.lookAt(new Vec3(targetPortal.x + 0.5, targetPortal.y + 0.5, targetPortal.z + 0.5), true);
bot.setControlState('forward', true);
console.log('Moving into portal...');
await sleep(2500);
bot.setControlState('forward', false);

console.log('Inside portal frame at:', lib.fmt(bot.entity.position));
bot.chat('delta: In portal frame, transiting to Nether now!');

// Wait for dimension change
const startDim = bot.game.dimension;
for (let i = 0; i < 20; i++) {
  await sleep(1000);
  if (bot.game.dimension !== startDim) {
    console.log(`Dimension changed to: ${bot.game.dimension}!`);
    break;
  }
}

console.log('Current dimension:', bot.game.dimension);
console.log('Current position:', lib.fmt(bot.entity.position));

if (bot.game.dimension.includes('nether')) {
  console.log('TRANSIT SUCCESSFUL! Delta is in the Nether!');
  bot.chat(`delta: Arrived in the Nether! Pos: ${lib.fmt(bot.entity.position)}. Carrying 48 cobble for bunker!`);

  // Step 2 blocks out of portal into bunker floor
  await sleep(1000);
  bot.setControlState('forward', true);
  await sleep(1000);
  bot.setControlState('forward', false);
  console.log('Stepped out of Nether portal to:', lib.fmt(bot.entity.position));

  // Check players nearby in the Nether
  for (const [name, p] of Object.entries(bot.players)) {
    if (p && p.entity) {
      console.log(`Player ${name} at ${lib.fmt(p.entity.position)}`);
    }
  }

  // Check hostiles nearby
  const hostiles = lib.hostiles(24);
  console.log('Hostiles within 24m:', JSON.stringify(hostiles));
}
