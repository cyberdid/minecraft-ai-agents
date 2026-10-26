// programs/317-reach-lava-and-make-obsidian.js
console.log('=== Step: Reach lava lake, quench with water, mine 10 obsidian ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Move to safe ledge near lava lake (288, 19, 8)
const m = new Movements(bot, mcData);
m.canDig = true;
m.allow1by1towers = true;
m.scaffoldingBlocks = [mcData.itemsByName.cobblestone.id];
m.liquidsCost = 100;
bot.pathfinder.setMovements(m);

console.log('Walking to safe ledge at (288, 19, 8)...');
try {
  await lib.goTo(288, 19, 8, 3, { dig: true, timeoutMs: 40000 });
  console.log('At lava lake area! Current pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Approach note:', e.message);
}

// 2. Scan for lava sources
const isAir = (b) => b && (b.name === 'air' || b.name === 'cave_air');
const lavaSources = bot.findBlocks({
  matching: b => b.name === 'lava' && b.metadata === 0,
  maxDistance: 32,
  count: 64
}).map(p => bot.blockAt(p)).filter(Boolean)
  .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Found ${lavaSources.length} lava source blocks within 32m.`);

// 3. Find solid edge to pour water
let edge = null;
for (const lava of lavaSources) {
  const up = bot.blockAt(lava.position.offset(0, 1, 0));
  if (!isAir(up)) continue;
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nb = bot.blockAt(lava.position.offset(dx, 0, dz));
    const nbUp = bot.blockAt(lava.position.offset(dx, 1, dz));
    if (nb && nb.boundingBox === 'block' && isAir(nbUp) && nb.name !== 'lava' && nb.name !== 'fire') {
      edge = nb;
      break;
    }
  }
  if (edge) break;
}

if (!edge && lavaSources.length > 0) {
  // If no natural edge, place a cobblestone block next to nearest lava
  const nearest = lavaSources[0];
  const placeTarget = nearest.position.offset(1, 0, 0);
  console.log(`Placing artificial cobblestone edge at ${lib.fmt(placeTarget)}...`);
  try {
    await lib.place('cobblestone', placeTarget.x, placeTarget.y, placeTarget.z);
    edge = bot.blockAt(placeTarget);
  } catch (err) {
    console.log('Place edge note:', err.message);
  }
}

if (edge) {
  console.log(`Selected edge block at ${lib.fmt(edge.position)} (${edge.name})`);
  // Move near edge
  try {
    await lib.goTo(edge.position.x, edge.position.y + 1, edge.position.z, 2, { timeoutMs: 15000 });
  } catch (e) {
    console.log('Go to edge note:', e.message);
  }

  // Pour water onto edge top
  if (lib.count('water_bucket') > 0) {
    console.log('Pouring water to quench lava pool...');
    await bot.equip(mcData.itemsByName.water_bucket.id, 'hand');
    await bot.lookAt(edge.position.offset(0.5, 1, 0.5), true);
    bot.activateItem();
    console.log('Water poured, waiting 3.5s for lava conversion...');
    await sleep(3500);

    // Scoop water back
    const water = bot.blockAt(edge.position.offset(0, 1, 0));
    if (water && water.name === 'water') {
      console.log('Scooping water back into bucket...');
      await bot.equip(mcData.itemsByName.bucket.id, 'hand');
      await bot.lookAt(edge.position.offset(0.5, 1, 0.5), true);
      bot.activateItem();
      await sleep(600);
      console.log('Water scooped back! water_bucket:', lib.count('water_bucket'));
    }
  }
}

// 4. Scan for obsidian and mine up to 10
const obsBlocks = bot.findBlocks({
  matching: b => b.name === 'obsidian',
  maxDistance: 24,
  count: 30
});
console.log(`Found ${obsBlocks.length} obsidian blocks available to mine.`);

if (obsBlocks.length > 0 && lib.count('diamond_pickaxe') > 0) {
  await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand');
  for (const pos of obsBlocks) {
    if (lib.count('obsidian') >= 10 || isCancelled()) break;
    const b = bot.blockAt(pos);
    if (!b || b.name !== 'obsidian') continue;
    console.log(`Mining obsidian at ${lib.fmt(pos)} (have ${lib.count('obsidian')}/10)...`);
    try {
      // Approach block within reach
      if (bot.entity.position.distanceTo(pos) > 4) {
        await lib.goTo(pos.x, pos.y + 1, pos.z, 3, { timeoutMs: 10000 });
      }
      await lib.dig(pos.x, pos.y, pos.z);
      await sleep(300);
      await lib.pickup(4);
    } catch (e) {
      console.log(`Mining note at ${lib.fmt(pos)}:`, e.message);
    }
  }
}

console.log(`Final Obsidian count: ${lib.count('obsidian')}/10`);
console.log('Beta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`beta: Obsidian progress: ${lib.count('obsidian')}/10 in inventory! Pos: ${lib.fmt(bot.entity.position)}`);
