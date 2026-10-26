// programs/292-reach-lava-lake-and-make-obsidian.js
console.log('=== Step 48: Reach (286, 8), descend to y=20, make 10 obsidian ===');

bot.chat('beta: Walking south to (286, 8) on surface, then descending staircase to y=20 for 10 obsidian!');

// 1. Walk south on surface to (286, 8)
console.log('Walking south to (286, 8)...');
try {
  await lib.goToXZ(286, 8, { timeoutMs: 25000 });
} catch (e) {
  console.log('Surface walk note:', e.message);
}
console.log('Arrived at surface (286, 8)! Beta at:', lib.fmt(bot.entity.position));

// 2. If Alpha is nearby, toss 2 cooked food
const alpha = bot.players['alpha']?.entity;
if (alpha && alpha.position.distanceTo(bot.entity.position) < 6) {
  console.log('Tossing 2 cooked_mutton to Alpha...');
  try {
    await bot.toss(mcData.itemsByName.cooked_mutton.id, null, 2);
  } catch (e) {}
}

// 3. Scan for surface cave opening or direct lava
let lavaInReach = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 32,
  count: 50
});
console.log(`Lava sources within 32: ${lavaInReach.length}`);

// 4. If no lava in immediate reach, descend staircase down to y=20
if (lavaInReach.length === 0 && bot.entity.position.y > 22) {
  console.log('Descending safe staircase towards y=20...');
  try {
    await lib.descend(20, { torchEvery: 6 });
    console.log('Descent complete! Beta now at:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Descend note:', e.message);
  }
}

// 5. Scan for lava sources at depth
lavaInReach = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 32,
  count: 50
});
console.log(`Lava sources at depth: ${lavaInReach.length}`);

// 6. Run lib.makeObsidian(10)
if (lavaInReach.length > 0 && lib.count('obsidian') < 10) {
  console.log('Making and mining 10 obsidian...');
  try {
    const res = await lib.makeObsidian(10);
    console.log('makeObsidian result:', JSON.stringify(res));
  } catch (e) {
    console.log('makeObsidian note:', e.message);
  }
}

// If blocks formed, mine them directly
if (lib.count('obsidian') < 10) {
  const obsBlocks = bot.findBlocks({
    matching: b => b && b.name === 'obsidian',
    maxDistance: 16,
    count: 20
  });
  console.log(`Obsidian blocks formed: ${obsBlocks.length}`);
  for (const op of obsBlocks) {
    if (lib.count('obsidian') >= 10 || isCancelled()) break;
    try {
      await bot.equip(mcData.itemsByName.diamond_pickaxe.id, 'hand');
      await lib.goTo(op.x, op.y + 1, op.z, 2, { timeoutMs: 15000, dig: true });
      await lib.dig(op.x, op.y, op.z);
      await sleep(200);
      await lib.pickup(6);
    } catch (e) {}
  }
}

console.log(`Beta obsidian count: ${lib.count('obsidian')}/10`);
console.log('Beta inv:', JSON.stringify(lib.inv()));
console.log('Beta tools:', JSON.stringify(lib.tools()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Obsidian progress: ${lib.count('obsidian')}/10. Pos: ${lib.fmt(bot.entity.position)}.`);
