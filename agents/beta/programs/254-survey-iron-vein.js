// programs/254-survey-iron-vein.js
console.log('=== Step 12: Survey iron ore near (300, 72, -44) ===');

// Check door and exit base
console.log('Exiting base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door note:', e.message);
  await lib.goTo(294, 72, -52, 1);
}

// Walk to (302, 72, -44)
console.log('Walking to (302, 72, -44)...');
await lib.goTo(302, 72, -44, 2);
console.log('At survey spot:', lib.fmt(bot.entity.position));

// Search for iron ores
const ironOres = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 48,
  count: 20
});
console.log(`Found ${ironOres.length} iron ore blocks within 48:`, ironOres.map(p => lib.fmt(p)));

// Search for coal ores
const coalOres = bot.findBlocks({
  matching: b => b && (b.name === 'coal_ore' || b.name === 'deepslate_coal_ore'),
  maxDistance: 48,
  count: 10
});
console.log(`Found ${coalOres.length} coal ore blocks within 48:`, coalOres.map(p => lib.fmt(p)));

// Check for holes/shafts down near (300..308, -44)
for (let x = 298; x <= 306; x += 2) {
  for (let z = -48; z <= -40; z += 2) {
    const b = bot.blockAt(new Vec3(x, 71, z));
    if (b && (b.name === 'air' || b.name === 'cave_air' || b.name.includes('stairs') || b.name.includes('ladder'))) {
      console.log(`Shaft/opening at (${x}, 71, ${z}): ${b.name}`);
    }
  }
}

console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Surveyed iron area. Found ${ironOres.length} iron ore and ${coalOres.length} coal ore nearby.`);
