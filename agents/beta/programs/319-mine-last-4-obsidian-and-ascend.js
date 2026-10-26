// programs/319-mine-last-4-obsidian-and-ascend.js
console.log('=== Step: Mine last 4 obsidian and ascend to base portal site ===');
console.log('Current obsidian in inv:', lib.count('obsidian'));

bot.chat(`beta: Holding ${lib.count('obsidian')}/10 obsidian! Mining last 4 now, then ascending to base!`);

await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand');

// 1. Mine until we have 10 obsidian
const p = bot.entity.position;
const obsBlocks = bot.findBlocks({
  matching: b => b.name === 'obsidian',
  maxDistance: 8,
  count: 20
}).map(pos => bot.blockAt(pos)).filter(Boolean)
  .sort((a, b) => a.position.distanceTo(p) - b.position.distanceTo(p));

console.log(`Found ${obsBlocks.length} obsidian blocks within 8m.`);

for (const b of obsBlocks) {
  if (lib.count('obsidian') >= 10 || isCancelled()) break;
  const dist = bot.entity.position.distanceTo(b.position);
  if (dist <= 4.2) {
    console.log(`Mining obsidian at ${lib.fmt(b.position)} (dist ${dist.toFixed(1)}m)...`);
    try {
      await bot.lookAt(b.position.offset(0.5, 0.5, 0.5), true);
      await bot.dig(b);
      await sleep(200);
      await lib.pickup(4);
      console.log(`Obsidian count now: ${lib.count('obsidian')}/10`);
    } catch (e) {
      console.log(`Dig error at ${lib.fmt(b.position)}:`, e.message);
    }
  }
}

// If still < 10, search slightly further (up to 5m)
if (lib.count('obsidian') < 10) {
  const more = bot.findBlocks({
    matching: b => b.name === 'obsidian',
    maxDistance: 12,
    count: 20
  }).map(pos => bot.blockAt(pos)).filter(Boolean)
    .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

  for (const b of more) {
    if (lib.count('obsidian') >= 10 || isCancelled()) break;
    try {
      if (bot.entity.position.distanceTo(b.position) > 4.0) {
        await lib.goTo(b.position.x, b.position.y + 1, b.position.z, 2, { timeoutMs: 10000 });
      }
      await bot.lookAt(b.position.offset(0.5, 0.5, 0.5), true);
      await bot.dig(b);
      await sleep(200);
      await lib.pickup(4);
      console.log(`Obsidian count now: ${lib.count('obsidian')}/10`);
    } catch (e) {
      console.log('Dig note:', e.message);
    }
  }
}

console.log(`Obsidian collected: ${lib.count('obsidian')}/10`);

// 2. Ascend to base if 10 obsidian reached
if (lib.count('obsidian') >= 10) {
  bot.chat(`beta: 10 OBSIDIAN SECURED! Ascending shaft to portal frame at (298, 72, -54)!`);

  const m = new Movements(bot, mcData);
  m.canDig = true;
  m.allow1by1towers = true;
  m.scaffoldingBlocks = [mcData.itemsByName.cobblestone.id];
  bot.pathfinder.setMovements(m);

  // Stage 1: Ascend to y=35
  console.log('Ascending stage 1 towards (304, 35, -34)...');
  try {
    await lib.goTo(304, 35, -34, 3, { dig: true, timeoutMs: 25000 });
    console.log('Reached y=35:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Stage 1 note:', e.message);
  }

  // Stage 2: Ascend to y=60
  console.log('Ascending stage 2 towards (302, 60, -40)...');
  try {
    await lib.goTo(302, 60, -40, 3, { dig: true, timeoutMs: 25000 });
    console.log('Reached y=60:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Stage 2 note:', e.message);
  }

  // Stage 3: Ascend to shaft top (302, 71, -44)
  console.log('Ascending stage 3 to shaft top (302, 71, -44)...');
  try {
    await lib.goTo(302, 71, -44, 2, { dig: true, timeoutMs: 25000 });
    console.log('At surface shaft top:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Stage 3 note:', e.message);
  }

  // Stage 4: Walk to portal frame (298, 72, -54)
  console.log('Walking to portal site (298, 72, -54)...');
  try {
    await lib.goTo(298, 72, -53, 2, { timeoutMs: 15000 });
    console.log('At portal site! Ready to build and ignite!');
  } catch (e) {
    console.log('Portal approach note:', e.message);
  }
}

console.log('Beta final position:', lib.fmt(bot.entity.position));
console.log('Beta inventory now:', JSON.stringify(lib.inv()));
