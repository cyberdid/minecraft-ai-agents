// programs/290-make-10-obsidian-at-lava-lake.js
console.log('=== Step 46: Mine 10 Obsidian and Complete Nether Portal ===');

bot.chat('beta: Heading to y=18 lava lake at (285, 18, 7) to make and mine 10 obsidian!');

// 1. Exit base
console.log('Exiting base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}

// 2. Walk to shaft entrance (302, 71, -44)
console.log('Walking to shaft entrance (302, 71, -44)...');
await lib.goTo(302, 71, -44, 1, { timeoutMs: 15000 });

// 3. Descend to y=18
console.log('Descending shaft to y=18...');
try {
  await lib.goTo(323, 18, -70, 3, { timeoutMs: 35000, dig: true });
  console.log('Reached y=18 shaft level!');
} catch (e) {
  console.log('Shaft descent note:', e.message);
}

// 4. Approach the lava lake at (285, 18, 7)
console.log('Navigating along y=18 towards lava lake at (285, 18, 7)...');
try {
  await lib.goTo(286, 19, 7, 4, { timeoutMs: 45000, dig: true });
  console.log('Arrived near lava lake! Beta at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Lake approach note:', e.message);
}

// Place a torch for visibility
try {
  await lib.placeTorch();
} catch (e) {}

// Check lava sources in reach
const lavas = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 24,
  count: 40
});
console.log(`Lava sources in range: ${lavas.length}`);

// 5. Run lib.makeObsidian(10)
console.log('Running lib.makeObsidian(10)...');
try {
  const obsReport = await lib.makeObsidian(10);
  console.log('makeObsidian report:', JSON.stringify(obsReport));
} catch (e) {
  console.log('makeObsidian note:', e.message);
}

// Also check custom dry obsidian mining if any obsidian blocks were formed
if (lib.count('obsidian') < 10) {
  console.log('Checking for formed obsidian blocks to mine directly...');
  const obsBlocks = bot.findBlocks({
    matching: b => b && b.name === 'obsidian',
    maxDistance: 16,
    count: 20
  });
  console.log(`Found ${obsBlocks.length} obsidian blocks in area.`);
  for (const op of obsBlocks) {
    if (lib.count('obsidian') >= 10 || isCancelled()) break;
    try {
      await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand');
      await lib.goTo(op.x, op.y + 1, op.z, 2, { timeoutMs: 15000, dig: true });
      await lib.dig(op.x, op.y, op.z);
      await sleep(200);
      await lib.pickup(6);
      console.log(`Mined obsidian at ${lib.fmt(op)}! Count now: ${lib.count('obsidian')}`);
    } catch (e) {
      console.log(`Dig error at ${lib.fmt(op)}:`, e.message);
    }
  }
}

console.log(`Total obsidian on Beta: ${lib.count('obsidian')}/10`);

// 6. Return to surface base at (294, 72, -54)
console.log('Ascending to surface base...');
try {
  await lib.goTo(323, 18, -70, 3, { timeoutMs: 35000, dig: true });
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 40000, dig: true });
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  console.log('Reached surface base! Beta at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Ascent note:', e.message);
}

// 7. Build and ignite Nether portal at (298, 72, -54)
if (lib.count('obsidian') >= 10) {
  console.log('Building Nether portal frame at (298, 72, -54)...');
  const frame = lib.shapes.portal(298, 72, -54, 'x');
  try {
    const buildRes = await lib.build(frame);
    console.log('Portal build result:', JSON.stringify(buildRes));
  } catch (e) {
    console.log('Portal build note:', e.message);
  }

  console.log('Igniting Nether portal with flint and steel at (299, 72, -54)...');
  try {
    const igniteRes = await lib.ignite(299, 72, -54);
    console.log('Ignite result:', igniteRes);
    bot.chat('alpha: NETHER PORTAL IS LIT AT (298, 72, -54)! MILESTONE 7 COMPLETE!');
  } catch (e) {
    console.log('Ignite note:', e.message);
  }
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Beta tools now:', JSON.stringify(lib.tools()));
bot.chat(`beta: Obsidian run finished. Obsidian count: ${lib.count('obsidian')}. Night in ${lib.time().secondsUntilNight}s.`);
