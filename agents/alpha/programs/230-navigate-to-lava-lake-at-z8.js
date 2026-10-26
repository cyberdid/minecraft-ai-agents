// programs/230-navigate-to-lava-lake-at-z8.js
console.log('=== Program 230: Navigate to 75-source Lava Lake at (286, 18, 8) ===');
console.log('Current Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check Beta
if (bot.players.beta?.entity) {
  const b = bot.players.beta.entity;
  console.log('Beta is right here at', lib.fmt(b.position), 'held:', b.heldItem?.name);
}

bot.chat('beta: The 75-source lava lake is at z=+8: (286, 18, 8)! We are currently at z=-70. Toss 2 food if you have spare, and let us head south to (286, 18, 8)!');

// Wait 2 seconds for any tossed items and pickup
await sleep(2000);
await lib.pickup(6);

// If we picked up food, eat
for (const foodName of ['cooked_porkchop', 'cooked_beef', 'cooked_mutton', 'bread', 'apple']) {
  if (lib.count(foodName) > 0) {
    console.log(`Eating ${foodName}...`);
    try {
      if (typeof safeEat === 'function') await safeEat(foodName);
      else await lib.eat();
    } catch (e) {}
  }
}

// 2. Stages towards (286, 18, 8)
const stages = [
  { x: 315, y: 19, z: -50 },
  { x: 305, y: 18, z: -30 },
  { x: 295, y: 18, z: -10 },
  { x: 286, y: 18, z: 8 }
];

for (let i = 0; i < stages.length; i++) {
  if (isCancelled()) break;
  const target = stages[i];
  console.log(`Navigating to stage ${i+1}/${stages.length}: ~(${target.x}, ${target.y}, ${target.z})...`);
  try {
    await lib.goTo(target.x, target.y, target.z, 3, { dig: true, timeoutMs: 25000 });
    console.log(`Reached stage ${i+1}! Pos:`, lib.fmt(bot.entity.position));
  } catch (err) {
    console.log(`Stage ${i+1} note:`, err.message);
  }

  // Scan for lava
  const lavas = bot.findBlocks({ matching: b => b.name === 'lava', maxDistance: 32, count: 50 });
  if (lavas.length > 5) {
    console.log(`Found ${lavas.length} lava blocks near stage ${i+1}!`);
  }
}

// 3. At or near (286, 18, 8), scan for massive lava lake
const allLava = bot.findBlocks({ matching: b => b.name === 'lava', maxDistance: 32, count: 100 });
const sources = allLava.map(p => bot.blockAt(p)).filter(b => b && b.metadata === 0);
console.log(`Near target: found ${allLava.length} lava blocks (${sources.length} sources)!`);

const allObs = bot.findBlocks({ matching: b => b.name === 'obsidian', maxDistance: 32, count: 20 });
console.log(`Obsidian blocks in sight: ${allObs.length}`);

bot.chat(`beta: At ${lib.fmt(bot.entity.position)}. Lava sources: ${sources.length}, Obsidian: ${allObs.length}. Quench and gather 10 obsidian!`);

console.log('Program 230 finished. Status:', JSON.stringify(lib.status()));
