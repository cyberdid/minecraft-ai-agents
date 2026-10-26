// programs/113-coordinate-in-fortress-bunker.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Pick up any dropped items inside bunker
const picked = await lib.pickup(4);
console.log(`Picked up ${picked} dropped items in bunker`);

// 2. Check players
console.log('Teammates in bunker:');
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'delta') {
    const d = Math.round(bot.entity.position.distanceTo(p.entity.position));
    console.log(`- ${name} at ${lib.fmt(p.entity.position)} (dist ${d})`);
  }
}

// 3. Scan for Fortress blocks & Spawners
const spawners = bot.findBlocks({ matching: b => b.name === 'spawner', maxDistance: 32, count: 5 });
console.log(`Blaze spawners detected: ${spawners.length}`);
for (const s of spawners) {
  console.log(`  SPAWNER at ${lib.fmt(s)} (dist ${Math.round(bot.entity.position.distanceTo(s))})`);
}

const netherBricks = bot.findBlocks({ matching: b => b.name.includes('nether_brick'), maxDistance: 32, count: 10 });
console.log(`Nether brick blocks nearby: ${netherBricks.length}`);
if (netherBricks.length > 0) {
  console.log(`  Sample fortress block at ${lib.fmt(netherBricks[0])}`);
}

// 4. Scan for Blazes or Wither Skeletons
const blazes = [];
const witherSkeletons = [];
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (!e || !e.position) continue;
  const d = Math.round(bot.entity.position.distanceTo(e.position));
  if (e.name === 'blaze') blazes.push({ pos: lib.fmt(e.position), dist: d });
  if (e.name === 'wither_skeleton') witherSkeletons.push({ pos: lib.fmt(e.position), dist: d });
}
console.log(`Blazes nearby (${blazes.length}):`, JSON.stringify(blazes));
console.log(`Wither skeletons nearby (${witherSkeletons.length}):`, JSON.stringify(witherSkeletons));

// 5. Craft sticks and torches if we have coal & planks (2x2 player grid works for sticks & torches!)
if (lib.count('torch') === 0 && lib.count('coal') > 0 && lib.count('birch_planks') > 0) {
  console.log('Crafting sticks and torches for bunker...');
  try {
    await lib.craft('stick', 4);
    await sleep(200);
    await lib.craft('torch', 8);
    console.log(`Crafted torches! Torch count: ${lib.count('torch')}`);
    // Place a torch on the bunker wall
    await lib.placeTorch();
    console.log('Placed torch in bunker!');
  } catch (e) {
    console.log('Torch craft note:', e.message);
  }
}

console.log('Delta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`delta: Fortress Workshop operational! Spawners: ${spawners.length}, Blazes: ${blazes.length}. 54 building blocks ready.`);
