// programs/404-defeat-mob-mine-cobble-and-march.js
console.log('=== DEFEND, QUARRY COBBLE & TRANSIT NETHER ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Equip stone sword and clear any nearby hostile
await lib.equipWeapon();
const hostiles = lib.hostiles(12);
if (hostiles.length > 0) {
  console.log('Nearby hostiles detected:', JSON.stringify(hostiles));
  try {
    await lib.fight(10, 12);
    console.log('Fight complete. Health:', bot.health);
  } catch (e) {
    console.log('Fight note:', e.message);
  }
}
try { await lib.pickup(6); } catch (e) {}

// 2. Mine stone safely on the hillside (stay at y >= 64, do not dig straight down)
if (lib.count('cobblestone') < 24) {
  const needed = 24 - lib.count('cobblestone');
  console.log(`Mining ${needed} cobblestone on hillside...`);
  // Find stone blocks at eye level or horizontal, not underfoot
  const stones = bot.findBlocks({
    matching: mcData.blocksByName.stone.id,
    maxDistance: 8,
    count: needed * 2
  }).filter(p => p.y >= 64 && !(p.x === Math.floor(bot.entity.position.x) && p.z === Math.floor(bot.entity.position.z) && p.y <= bot.entity.position.y));

  console.log(`Found ${stones.length} safe stone blocks above y=64.`);
  let mined = 0;
  for (const sPos of stones) {
    if (mined >= needed || isCancelled()) break;
    try {
      const b = bot.blockAt(sPos);
      if (b && b.name === 'stone') {
        await bot.dig(b);
        mined++;
        await sleep(100);
      }
    } catch (de) {}
  }
  try { await lib.pickup(6); } catch (e) {}
  console.log(`Mined ${mined} stone. Total cobble: ${lib.count('cobblestone')}`);
}

// 3. Move via gentle west slope (280, 71, -60) up to base door (294, 72, -53)
console.log('Ascending gentle slope to base plateau...');
try {
  await lib.goTo(280, 71, -60, 2, { dig: false, timeoutMs: 10000 });
} catch (e) {}

console.log('Moving to base door outside (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: false, timeoutMs: 12000 });
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -53, 1));
  } catch (e2) {}
}

// 4. Move to Nether portal entrance at (297.0, 72.0, -53.5)
console.log('Approaching Nether portal...');
try {
  await lib.goTo(297, 72, -53, 1, { dig: false, timeoutMs: 8000 });
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(297, 72, -53, 1));
  } catch (e2) {}
}

// 5. Step inside Nether portal at y=73
console.log('Stepping into Nether portal frame at (298.5, 73.0, -53.5)...');
bot.setControlState('jump', true);
bot.setControlState('forward', true);
await sleep(400);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

try {
  await bot.pathfinder.goto(new goals.GoalBlock(298, 73, -54));
} catch (e) {}

console.log('Inside portal frame! Waiting for Nether transition...');
const deadline = Date.now() + 18000;
while (Date.now() < deadline && bot.game.dimension !== 'the_nether' && !isCancelled()) {
  await sleep(500);
}

if (bot.game.dimension === 'the_nether') {
  console.log('TRANSIT SUCCESS! Dimension: the_nether, pos:', lib.fmt(bot.entity.position));
  bot.chat('gamma: Inside Nether Portal Bunker! Pos: ' + lib.fmt(bot.entity.position));
  try {
    await lib.walkTo(40.5, -8.5, 2000);
  } catch (e) {}
} else {
  console.log('Dimension:', bot.game.dimension, 'at pos:', lib.fmt(bot.entity.position));
}

console.log('Ending status:', JSON.stringify(lib.status()));
