// programs/266-survey-surface-lava-pool.js
console.log('=== Step 24: Survey surface lava pool at (333, 62, -78) ===');
console.log('Starting pos:', lib.fmt(bot.entity.position), 'night in:', lib.time().secondsUntilNight);

// 1. Exit base door
console.log('Exiting base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}

// 2. Walk towards (333, 62, -78)
console.log('Walking towards lava pool at (333, 62, -78)...');
try {
  await lib.goToXZ(330, -75, { timeoutMs: 25000 });
} catch (e) {
  console.log('Walk to lava pool note:', e.message);
}

console.log('Near lava pool. Beta at:', lib.fmt(bot.entity.position));

// 3. Scan for lava sources
const lavaSources = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 24,
  count: 50
});
console.log(`Found ${lavaSources.length} lava source blocks near (333, -78)!`);
if (lavaSources.length > 0) {
  console.log('First 5 lava sources:', lavaSources.slice(0, 5).map(p => lib.fmt(p)));
}

// 4. Scan for any sheep nearby to shear
const sheep = Object.values(bot.entities).find(e => 
  e && e.name === 'sheep' && e.position && e.position.distanceTo(bot.entity.position) < 32
);
if (sheep) {
  console.log(`Found sheep near lava area at ${lib.fmt(sheep.position)}!`);
  try {
    await bot.equip(mcData.itemsByName.shears.id, 'hand');
    await lib.goTo(sheep.position.x, sheep.position.y, sheep.position.z, 2, { timeoutMs: 15000 });
    await bot.activateEntity(sheep);
    await sleep(500);
    await lib.pickup(6);
    console.log('Sheared sheep! Wool on beta:', JSON.stringify(Object.fromEntries(Object.entries(lib.inv()).filter(([k]) => k.includes('wool')))));
  } catch (e) {
    console.log('Shear error:', e.message);
  }
}

// 5. Return to base
console.log('Returning to base at (294, 72, -54)...');
try {
  await lib.goToXZ(294, -54, { timeoutMs: 30000 });
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base safely!');
} catch (e) {
  console.log('Return error:', e.message);
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Surface lava pool survey: ${lavaSources.length} lava sources found at (333, 62, -78). Water bucket ready!`);
