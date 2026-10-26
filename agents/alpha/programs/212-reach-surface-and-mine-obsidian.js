// programs/212-reach-surface-and-mine-obsidian.js
console.log('=== Program 212: Reach Surface & Gather 10 Obsidian ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Time until night:', lib.time().secondsUntilNight);

bot.chat('beta: Climbing final stretch of stairs to surface, then mining 10 obsidian at (333, 62, -78)!');

// 1. Finish climbing to surface exit at (345, 65, -40)
if (bot.entity.position.y < 60) {
  console.log('Climbing to surface (345, 65, -40)...');
  try {
    await lib.goTo(345, 65, -40, 2, { dig: true, timeoutMs: 35000 });
    console.log('At surface! Pos:', lib.fmt(bot.entity.position));
  } catch (err) {
    console.log('Climb note:', err.message, 'Pos:', lib.fmt(bot.entity.position));
  }
}

// 2. Navigate towards lava pool at (333, 62, -78)
console.log('Navigating towards lava pool at (333, 62, -78)...');
try {
  await lib.goTo(333, 64, -75, 3, { timeoutMs: 30000 });
  console.log('Near lava pool! Pos:', lib.fmt(bot.entity.position));
} catch (err) {
  console.log('Travel to lava pool note:', err.message, 'Pos:', lib.fmt(bot.entity.position));
}

// 3. Check existing obsidian blocks around (333, 62, -78)
const existingObsidian = bot.findBlocks({
  matching: b => b.name === 'obsidian',
  maxDistance: 32,
  count: 20
});
console.log(`Found ${existingObsidian.length} existing obsidian blocks nearby.`);

// Mine any existing obsidian if available
const diaPick = mcData.itemsByName.diamond_pickaxe.id;
if (existingObsidian.length > 0 && lib.count('obsidian') < 10) {
  for (const pos of existingObsidian) {
    if (isCancelled() || lib.count('obsidian') >= 10) break;
    if (lib.time().secondsUntilNight < 80) {
      console.log('Night approaching (<80s), stopping mining!');
      break;
    }
    console.log(`Mining existing obsidian at ${lib.fmt(pos)}...`);
    try {
      await bot.equip(diaPick, 'hand');
      await lib.goTo(pos.x, pos.y, pos.z, 2, { timeoutMs: 15000 });
      await bot.equip(diaPick, 'hand');
      await lib.dig(pos.x, pos.y, pos.z);
      await sleep(300);
      await lib.pickup(5);
    } catch (err) {
      console.log('Dig obsidian note:', err.message);
    }
    console.log(`Obsidian count now: ${lib.count('obsidian')}`);
  }
}

// 4. If still under 10 obsidian, call lib.makeObsidian
if (lib.count('obsidian') < 10 && lib.time().secondsUntilNight >= 90) {
  console.log(`Need ${10 - lib.count('obsidian')} more obsidian. Running lib.makeObsidian(10)...`);
  try {
    const res = await lib.makeObsidian(10);
    console.log('makeObsidian result:', JSON.stringify(res));
  } catch (err) {
    console.log('makeObsidian error:', err.message);
  }
}

console.log(`Total obsidian in inventory: ${lib.count('obsidian')}`);

// 5. If night is approaching or we have 10 obsidian, head to base (294, 72, -52)
if (lib.count('obsidian') >= 10 || lib.time().secondsUntilNight < 90) {
  console.log('Heading to base / portal site (294, 72, -52)...');
  try {
    await lib.goTo(294, 72, -52, 2, { timeoutMs: 35000 });
    console.log('Arrived near base! Pos:', lib.fmt(bot.entity.position));
  } catch (err) {
    console.log('Travel to base note:', err.message);
  }
}

bot.chat(`beta: Obsidian count: ${lib.count('obsidian')}/10. Pos: ${lib.fmt(bot.entity.position)}. Night in: ${lib.time().secondsUntilNight}s.`);
console.log('Finished 212. Status:', JSON.stringify(lib.status()));
