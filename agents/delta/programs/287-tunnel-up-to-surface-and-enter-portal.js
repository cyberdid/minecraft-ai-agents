// programs/287-tunnel-up-to-surface-and-enter-portal.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// Equip stone_pickaxe
const pick = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (pick) await bot.equip(pick, 'hand');

// Coordinates to dig up along: x=288, z=-57
const targetX = 288;
const targetZ = -57;

// Function to safely dig a block
async function digBlock(x, y, z) {
  const b = bot.blockAt(new Vec3(x, y, z));
  if (b && b.name !== 'air' && b.name !== 'water' && b.name !== 'cave_air') {
    try {
      await bot.dig(b);
    } catch (e) {
      console.log(`Dig error at (${x},${y},${z}):`, e.message);
    }
  }
}

// Function to jump and place block beneath
async function towerUp() {
  const cobble = bot.inventory.items().find(i => i.name === 'cobblestone' || i.name === 'dirt' || i.name === 'netherrack');
  if (!cobble) {
    console.log('No block to tower with!');
    return false;
  }
  await bot.equip(cobble, 'hand');
  bot.setControlState('jump', true);
  await sleep(250);
  const pBelow = bot.entity.position.offset(0, -0.5, 0).floored();
  try {
    const ref = bot.blockAt(pBelow.offset(0, -1, 0));
    if (ref) {
      await bot.placeBlock(ref, new Vec3(0, 1, 0));
    }
  } catch (e) {
    // try placing against adjacent block
  }
  bot.setControlState('jump', false);
  await sleep(100);
  return true;
}

// Climb/dig upward from current Y to Y=72
console.log('Digging straight up to surface Y=72...');
while (bot.entity.position.y < 71.5) {
  const curY = Math.floor(bot.entity.position.y);
  // Clear blocks 1, 2, and 3 above player head
  for (let dy = 2; dy <= 3; dy++) {
    await digBlock(targetX, curY + dy, targetZ);
  }
  
  // Jump up or swim up
  bot.setControlState('jump', true);
  await sleep(300);
  
  // Place block under feet
  const blockToPlace = bot.inventory.items().find(i => i.name === 'cobblestone' || i.name === 'stone');
  if (blockToPlace) {
    await bot.equip(blockToPlace, 'hand');
    const under = bot.blockAt(new Vec3(targetX, curY, targetZ));
    if (under && (under.name === 'air' || under.name === 'water')) {
      const support = bot.blockAt(new Vec3(targetX, curY - 1, targetZ));
      if (support && support.name !== 'air') {
        try {
          await bot.placeBlock(support, new Vec3(0, 1, 0));
        } catch (e) {}
      }
    }
  }
  bot.setControlState('jump', false);
  await sleep(100);
  
  // If we climbed past 71, stop
  if (bot.entity.position.y >= 71) {
    console.log('Reached surface level! Pos:', lib.fmt(bot.entity.position));
    break;
  }
}
bot.setControlState('jump', false);

console.log('Current pos after ascent:', lib.fmt(bot.entity.position));

// Now navigate to Overworld Nether Portal at (299.5, 73.0, -53.5)
console.log('Moving to Nether Portal...');
try {
  await lib.goTo(299, 73, -54, 1);
} catch (e) {
  console.log('goTo portal near:', e.message);
}

// Step precisely into the portal block
console.log('Stepping into portal center (299.5, 73.0, -53.5)...');
const portalPos = new Vec3(299.5, 73.0, -53.5);
for (let i = 0; i < 30; i++) {
  const diff = portalPos.minus(bot.entity.position);
  if (Math.abs(diff.x) < 0.25 && Math.abs(diff.z) < 0.25) break;
  await bot.lookAt(new Vec3(portalPos.x, bot.entity.position.y + 1.6, portalPos.z), true);
  bot.setControlState('forward', true);
  await sleep(100);
}
bot.setControlState('forward', false);

console.log('Inside portal frame! Waiting for teleport to Nether...');
for (let i = 0; i < 16; i++) {
  await sleep(500);
  if (bot.game.dimension === 'the_nether') {
    console.log('SUCCESS! Arrived in the_nether at:', lib.fmt(bot.entity.position));
    bot.chat(`delta: Back in Nether at ${lib.fmt(bot.entity.position)} armed with stone sword & ${lib.count('cobblestone')} cobble! Joining team at Spawner!`);
    break;
  }
}

console.log('Final dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
