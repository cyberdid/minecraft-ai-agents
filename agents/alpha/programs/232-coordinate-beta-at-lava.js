// programs/232-coordinate-beta-at-lava.js
console.log('=== Program 232: Inspect & Prepare Lava Lake for Obsidian ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Scan lava blocks in reach
const lavas = bot.findBlocks({ matching: b => b.name === 'lava', maxDistance: 16, count: 50 });
console.log(`Found ${lavas.length} lava blocks within 16m:`);

const sourcesWithAir = [];
for (const p of lavas) {
  const blk = bot.blockAt(p);
  const up = bot.blockAt(p.offset(0, 1, 0));
  if (blk.metadata === 0) {
    console.log(`  Lava source at ${lib.fmt(p)}: up=${up?.name}`);
    if (up && up.name === 'air') {
      sourcesWithAir.push(p);
    }
  }
}
console.log(`Open lava sources with air above: ${sourcesWithAir.length}`);

// 2. If there are sources covered by stone/gravel, clear 2-3 blocks above them
if (sourcesWithAir.length < 5) {
  console.log('Clearing ceiling above lava sources to expose them...');
  for (const p of lavas.slice(0, 8)) {
    const up = bot.blockAt(p.offset(0, 1, 0));
    if (up && up.name !== 'air' && up.name !== 'water' && up.name !== 'lava') {
      console.log(`Digging ceiling ${up.name} at ${lib.fmt(up.position)}...`);
      try {
        await lib.dig(up.position.x, up.position.y, up.position.z);
      } catch (e) {}
    }
  }
}

// 3. Ensure a solid cobblestone edge next to an open lava source
const freshOpen = bot.findBlocks({ matching: b => b.name === 'lava' && b.metadata === 0, maxDistance: 16 })
  .filter(p => bot.blockAt(p.offset(0, 1, 0))?.name === 'air');

console.log(`Total open lava sources now: ${freshOpen.length}`);
if (freshOpen.length > 0) {
  const target = freshOpen[0];
  console.log(`Target lava source for obsidian: ${lib.fmt(target)}`);
  // Check neighbors for solid edge
  let hasEdge = false;
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nb = bot.blockAt(target.offset(dx, 0, dz));
    const nbUp = bot.blockAt(target.offset(dx, 1, dz));
    if (nb && nb.boundingBox === 'block' && nbUp && nbUp.name === 'air') {
      hasEdge = true;
      console.log(`Solid edge already exists at ${lib.fmt(nb.position)}!`);
      break;
    }
  }
  if (!hasEdge && lib.count('cobblestone') > 0) {
    const placePos = target.offset(1, 0, 0);
    console.log(`Placing cobblestone edge at ${lib.fmt(placePos)}...`);
    try {
      await lib.place('cobblestone', placePos.x, placePos.y, placePos.z);
    } catch (e) {
      console.log('Place edge note:', e.message);
    }
  }
}

// 4. Check Beta
if (bot.players.beta?.entity) {
  const b = bot.players.beta.entity;
  console.log('Beta pos:', lib.fmt(b.position), 'held:', b.heldItem?.name);
}

bot.chat(`beta: Lava pool prepped at (287, 19, 8)! Open sources: ${freshOpen.length}. Head to (287, 19, 8) with water bucket and diamond pickaxe!`);

console.log('Alpha status:', JSON.stringify(lib.status()));
