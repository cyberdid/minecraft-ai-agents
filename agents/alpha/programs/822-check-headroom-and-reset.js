// programs/822-check-headroom-and-reset.js
console.log('=== Program 822: Headroom Check & Tactical Reset ===');
const p = bot.entity.position;
console.log(`Current pos: ${lib.fmt(p)}, HP: ${bot.health}`);

// Check blocks directly above from y=26 to 40
for (let y = Math.floor(p.y); y <= Math.floor(p.y) + 15; y++) {
  const b = bot.blockAt(new Vec3(Math.floor(p.x), y, Math.floor(p.z)));
  console.log(`y=${y}: ${b?.name}`);
}

// Equip cobblestone
const cobble = bot.inventory.items().find(it => it.name === 'cobblestone');
if (cobble) await bot.equip(cobble, 'hand');

// Look straight down
await bot.look(bot.entity.yaw, -Math.PI / 2, true);

// Pillar up 6 blocks
const startY = bot.entity.position.y;
console.log(`Starting pillar from y=${startY.toFixed(2)}...`);

for (let i = 0; i < 7; i++) {
  const blockBelow = bot.blockAt(bot.entity.position.offset(0, -1, 0));
  if (!blockBelow) continue;
  
  bot.setControlState('jump', true);
  await sleep(200);
  try {
    await bot.placeBlock(blockBelow, new Vec3(0, 1, 0));
  } catch (e) {
    console.log(`Step ${i} placeBlock error:`, e.message);
  }
  bot.setControlState('jump', false);
  await sleep(250);
}

const finalY = bot.entity.position.y;
console.log(`Pillar completed. final y=${finalY.toFixed(2)}, climbed: ${(finalY - startY).toFixed(2)} blocks`);

// If climbed >= 4.5 blocks, step off onto the lower ledge (at startY) to take fall damage!
if (finalY - startY >= 4) {
  console.log('Stepping off to take fall damage reset...');
  // Look horizontally away from pillar towards solid block below
  await bot.look(0, 0, true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.clearControlStates();
}

// Wait to see if respawned or HP changed
await sleep(2000);
console.log(`Post-fall: dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}, HP=${bot.health}`);
