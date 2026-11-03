// programs/785-scoop-spilled-lava-and-place.js
console.log('=== Program 785: Inspect Spilled Lava & Transfer to Sill ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'inventory:', lib.inv());

// 1. Scan 5x5 area around portal frame
for (let y = 74; y >= 71; y--) {
  for (let x = 296; x <= 301; x++) {
    for (let z = -55; z <= -51; z++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      if (b && (b.name === 'lava' || b.name === 'obsidian' || b.name === 'water')) {
        console.log(`Block at (${x}, ${y}, ${z}): ${b.name}, props: ${JSON.stringify(b.getProperties())}`);
      }
    }
  }
}

// 2. Check if any lava source (level 0) is nearby
const lavaBlocks = bot.findBlocks({ matching: mcData.blocksByName.lava.id, maxDistance: 6, count: 10 });
console.log(`Lava blocks found (${lavaBlocks.length}):`, lavaBlocks.map(p => lib.fmt(p)));

const sources = lavaBlocks.filter(p => {
  const b = bot.blockAt(p);
  const props = b.getProperties();
  return props.level === '0' || props.level === 0 || (!props.level && b.metadata === 0);
});

console.log(`Lava sources found (${sources.length}):`, sources.map(p => lib.fmt(p)));

// If there is a lava source, SCOOP IT!
if (sources.length > 0 && lib.count('bucket') > 0) {
  const src = sources[0];
  console.log(`Scooping lava source at ${lib.fmt(src)}...`);
  const bkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (bkt) await bot.equip(bkt, 'hand');
  await bot.lookAt(src.offset(0.5, 0.8, 0.5), true);
  bot.activateItem();
  await sleep(1000);
}

console.log('Lava bucket count now:', lib.count('lava_bucket'));

// 3. Clear any water at sill (299, 72, -54)
const sillBlock = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Sill block currently: ${sillBlock?.name}`);
if (sillBlock && sillBlock.name === 'water') {
  console.log('Removing water at sill with bucket or block...');
  // Place cobblestone at (299, 72, -54) to clear water, then dig it
  await lib.place('cobblestone', 299, 72, -54);
  await sleep(400);
  await lib.dig(299, 72, -54);
  console.log('Sill cleared to air:', bot.blockAt(new Vec3(299, 72, -54))?.name);
}

// 4. If Alpha holds lava_bucket:
if (lib.count('lava_bucket') > 0) {
  console.log('Placing lava bucket into sill at (299, 72, -54)...');
  bot.chat('alpha: Placing lava bucket into sill (299, 72, -54)!');
  const lb = bot.inventory.items().find(i => i.name === 'lava_bucket');
  if (lb) await bot.equip(lb, 'hand');
  await bot.lookAt(new Vec3(299.5, 71.9, -54.0), true);
  bot.activateItem();
  await sleep(1000);

  // Scoop water from base water source (292, 71, -50)
  console.log('Scooping water from base water pool...');
  const wb = bot.findBlock({ matching: b => b && b.name === 'water' && (b.getProperties()?.level === '0' || b.getProperties()?.level === 0 || b.metadata === 0), maxDistance: 16 });
  if (wb) {
    await bot.pathfinder.goto(new goals.GoalNear(wb.position.x, wb.position.y + 1, wb.position.z, 2.0));
    const bkt = bot.inventory.items().find(i => i.name === 'bucket');
    if (bkt) await bot.equip(bkt, 'hand');
    await bot.lookAt(wb.position.offset(0.5, 0.8, 0.5), true);
    bot.activateItem();
    await sleep(800);
  }

  // Quench lava at (299, 72, -54)
  console.log('Quenching lava at sill with water...');
  await bot.pathfinder.goto(new goals.GoalNear(299, 73, -52, 1.2));
  const wbi = bot.inventory.items().find(i => i.name === 'water_bucket');
  if (wbi) {
    await bot.equip(wbi, 'hand');
    await bot.lookAt(new Vec3(298.5, 73.5, -54.0), true);
    bot.activateItem();
    await sleep(1500);

    const bkt = bot.inventory.items().find(i => i.name === 'bucket');
    if (bkt) await bot.equip(bkt, 'hand');
    await bot.lookAt(new Vec3(298.5, 73.5, -54.0), true);
    bot.activateItem();
    await sleep(800);
  }
}

// 5. Check if sill is obsidian and ignite!
const finalSill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Final sill block at (299, 72, -54): ${finalSill?.name}`);

if (finalSill && finalSill.name === 'obsidian') {
  console.log('OBSIDIAN CONFIRMED! Striking with flint_and_steel...');
  const fas = bot.inventory.items().find(i => i.name === 'flint_and_steel');
  if (fas) {
    await bot.equip(fas, 'hand');
    await bot.activateBlock(finalSill, new Vec3(0, 1, 0));
    await sleep(1200);
  }
}

let portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
console.log(`Active portals: ${portals.length}`);

if (portals.length > 0) {
  bot.chat(`alpha: NETHER PORTAL ACTIVE (${portals.length} blocks)! Milestone 7 RESTORED! Entering Nether!`);
  const res = await enterNetherPortal(20000);
  console.log('Transit:', JSON.stringify(res));
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  sill: bot.blockAt(new Vec3(299, 72, -54))?.name,
  portals: portals.length,
  inv: lib.inv()
};
