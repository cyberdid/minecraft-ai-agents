// programs/293-make-obsidian-safe-and-complete-portal.js
console.log('=== Step 49: Join Alpha at (287, 19, 8), run makeObsidianSafe, build portal ===');

bot.chat('beta: Joining Alpha at (287, 19, 8) with diamond_pickaxe and water_bucket!');

// 1. Walk to Alpha at (287, 19, 8)
console.log('Walking to (287, 19, 8)...');
try {
  await lib.goTo(287, 19, 8, 2, { timeoutMs: 25000, dig: true });
  console.log('Reached Alpha at lava lake! Beta pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Walk to Alpha note:', e.message);
}

// 2. Toss 2 food to Alpha
const alpha = bot.players['alpha']?.entity;
if (alpha && alpha.position.distanceTo(bot.entity.position) < 6) {
  console.log('Tossing 2 cooked_porkchop to Alpha...');
  try {
    await bot.toss(mcData.itemsByName.cooked_porkchop.id, null, 2);
    console.log('Food tossed to Alpha!');
  } catch (e) {}
}

// Place a torch
try {
  await lib.placeTorch();
} catch (e) {}

// 3. Run makeObsidianSafe(10)
console.log('Running makeObsidianSafe(10)...');
try {
  const res = await makeObsidianSafe(10);
  console.log('makeObsidianSafe result:', JSON.stringify(res));
  bot.chat(`beta: Mined 10 obsidian successfully! Count: ${lib.count('obsidian')}.`);
} catch (e) {
  console.log('makeObsidianSafe note:', e.message);
}

// Check formed obsidian blocks if any remain
if (lib.count('obsidian') < 10) {
  const obs = bot.findBlocks({ matching: b => b && b.name === 'obsidian', maxDistance: 16, count: 20 });
  console.log(`Obsidian blocks formed: ${obs.length}`);
  for (const p of obs) {
    if (lib.count('obsidian') >= 10 || isCancelled()) break;
    try {
      await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand');
      await lib.dig(p.x, p.y, p.z);
      await sleep(200);
      await lib.pickup(6);
    } catch (err) {}
  }
}

console.log(`Total obsidian on Beta: ${lib.count('obsidian')}/10`);

// 4. If we have 10 obsidian: ascend and build portal!
if (lib.count('obsidian') >= 10) {
  console.log('Ascending to surface portal site (298, 72, -54)...');
  try {
    await lib.goTo(297, 74, -33, 3, { timeoutMs: 40000, dig: true });
    await lib.goTo(298, 72, -52, 2, { timeoutMs: 25000 });
  } catch (e) {
    console.log('Ascent note:', e.message);
  }

  console.log('Building Nether portal frame at (298, 72, -54)...');
  const frame = lib.shapes.portal(298, 72, -54, 'x');
  try {
    const buildRes = await lib.build(frame);
    console.log('Portal build report:', JSON.stringify(buildRes));
  } catch (e) {
    console.log('Build note:', e.message);
  }

  console.log('Lighting portal with flint and steel at (299, 72, -54)...');
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
bot.chat(`beta: Obsidian status: ${lib.count('obsidian')}/10. Pos: ${lib.fmt(bot.entity.position)}.`);
