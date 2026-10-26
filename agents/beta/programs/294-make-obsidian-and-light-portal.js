// programs/294-make-obsidian-and-light-portal.js
console.log('=== Step 50: Quench lava, mine 10 obsidian, build and light portal ===');
console.log('Beta pos:', lib.fmt(bot.entity.position));

// Toss 2 cooked food to Alpha if nearby
const alpha = bot.players['alpha']?.entity;
if (alpha && alpha.position.distanceTo(bot.entity.position) < 8) {
  try {
    await bot.toss(mcData.itemsByName.cooked_porkchop.id, null, 2);
    console.log('Tossed 2 cooked_porkchop to Alpha.');
  } catch (e) {}
}

// 1. Quench lava into obsidian
async function quenchLava() {
  const isAir = (b) => b && (b.name === 'air' || b.name === 'cave_air');
  const lavas = bot.findBlocks({
    matching: b => b && b.name === 'lava' && b.metadata === 0,
    maxDistance: 16,
    count: 50
  }).map(p => bot.blockAt(p)).filter(Boolean);

  console.log(`Found ${lavas.length} lava source blocks within 16.`);
  if (!lavas.length) return 0;

  // Find a solid block next to a lava source with air above it
  let edge = null;
  for (const lava of lavas) {
    const up = bot.blockAt(lava.position.offset(0, 1, 0));
    if (!isAir(up)) continue;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nb = bot.blockAt(lava.position.offset(dx, 0, dz));
      const nbUp = bot.blockAt(lava.position.offset(dx, 1, dz));
      if (nb && nb.boundingBox === 'block' && isAir(nbUp)) {
        edge = nb;
        break;
      }
    }
    if (edge) break;
  }

  // If no natural solid edge, place a cobblestone block next to the nearest lava
  if (!edge && lavas.length > 0) {
    const targetLava = lavas[0];
    const placePos = targetLava.position.offset(1, 0, 0);
    console.log(`Placing support cobblestone at ${lib.fmt(placePos)}...`);
    try {
      await lib.place('cobblestone', placePos.x, placePos.y, placePos.z);
      edge = bot.blockAt(placePos);
    } catch (e) {
      console.log('Place support note:', e.message);
    }
  }

  if (edge) {
    const e = edge.position;
    console.log(`Pouring water on top of solid edge at ${lib.fmt(e)}...`);
    await bot.pathfinder.goto(new goals.GoalNear(e.x, e.y + 1, e.z, 2));
    await bot.equip(mcData.itemsByName.water_bucket.id, 'hand');
    await bot.lookAt(e.offset(0.5, 1, 0.5), true);
    bot.activateItem();
    await sleep(2500);

    // Retrieve water
    console.log('Retrieving water back into bucket...');
    const water = bot.blockAt(e.offset(0, 1, 0));
    if (water && (water.name === 'water' || water.name === 'flowing_water')) {
      await bot.equip(mcData.itemsByName.bucket.id, 'hand');
      await bot.lookAt(e.offset(0.5, 1.2, 0.5), true);
      bot.activateItem();
      await sleep(600);
    }
  }

  const formed = bot.findBlocks({
    matching: b => b && b.name === 'obsidian',
    maxDistance: 16,
    count: 30
  });
  console.log(`Obsidian blocks formed: ${formed.length}`);
  return formed.length;
}

// Check initial obsidian
let obsCount = bot.findBlocks({ matching: b => b && b.name === 'obsidian', maxDistance: 16, count: 20 }).length;
if (obsCount < 10) {
  await quenchLava();
}

// 2. Mine 10 obsidian blocks with diamond pickaxe
console.log('Mining obsidian with diamond pickaxe...');
while (lib.count('obsidian') < 10 && !isCancelled()) {
  const obsBlocks = bot.findBlocks({
    matching: b => b && b.name === 'obsidian',
    maxDistance: 16,
    count: 20
  }).sort((a, b) => a.distanceTo(bot.entity.position) - b.distanceTo(bot.entity.position));

  if (!obsBlocks.length) {
    console.log('No more obsidian in reach, quenching more lava...');
    const newFormed = await quenchLava();
    if (newFormed === 0) break;
    continue;
  }

  for (const p of obsBlocks) {
    if (lib.count('obsidian') >= 10 || isCancelled()) break;
    try {
      console.log(`Digging obsidian at ${lib.fmt(p)}... (have ${lib.count('obsidian')}/10)`);
      await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand');
      await lib.goTo(p.x, p.y + 1, p.z, 2, { timeoutMs: 15000, dig: true });
      await lib.dig(p.x, p.y, p.z);
      await sleep(200);
      await lib.pickup(6);
    } catch (e) {
      console.log(`Dig error at ${lib.fmt(p)}:`, e.message);
    }
  }
}

console.log(`Total obsidian in Beta inventory: ${lib.count('obsidian')}/10`);
bot.chat(`beta: Mined obsidian! Total count: ${lib.count('obsidian')}/10. Ascending to portal!`);

// 3. Ascend to surface portal site (298, 72, -54)
if (lib.count('obsidian') >= 10) {
  console.log('Ascending to surface portal frame at (298, 72, -54)...');
  try {
    await lib.goTo(297, 74, -33, 3, { timeoutMs: 40000, dig: true });
    await lib.goTo(298, 72, -53, 2, { timeoutMs: 25000 });
    console.log('At portal site! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Ascent note:', e.message);
  }

  // 4. Build portal frame
  console.log('Building portal frame at (298, 72, -54)...');
  const frame = lib.shapes.portal(298, 72, -54, 'x');
  try {
    const buildReport = await lib.build(frame);
    console.log('Portal build report:', JSON.stringify(buildReport));
  } catch (e) {
    console.log('Build note:', e.message);
  }

  // 5. Ignite portal with flint and steel
  console.log('Igniting Nether portal at (299, 72, -54)...');
  try {
    const igniteReport = await lib.ignite(299, 72, -54);
    console.log('Ignite report:', igniteReport);
    bot.chat('alpha: NETHER PORTAL IS LIT AT (298, 72, -54)! MILESTONE 7 COMPLETE!');
  } catch (e) {
    console.log('Ignite note:', e.message);
  }
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Beta tools now:', JSON.stringify(lib.tools()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Turn step finished. Obsidian: ${lib.count('obsidian')}/10. Time: ${lib.time().secondsUntilNight}s until night.`);
