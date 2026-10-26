// programs/231-meet-beta-at-lava-lake.js
console.log('=== Program 231: Meet Beta at (286, 20, 8) & Gather Obsidian ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Tell Beta exact spot and request food toss
bot.chat('beta: I am at (293, 17, 5) right at the 84-source lava lake! Food is 8, toss 2 cooked porkchop! Lava lake is right here!');

// 2. Head to meeting spot (286, 20, 8)
const meetSpot = new Vec3(286, 20, 8);
console.log('Moving/digging towards meeting spot (286, 20, 8)...');
try {
  await lib.goTo(meetSpot.x, meetSpot.y, meetSpot.z, 2, { dig: true, timeoutMs: 25000 });
  console.log('Arrived near meeting spot! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Move note:', e.message);
}

// 3. Pickup any tossed items (food, obsidian)
await lib.pickup(6);

// Eat any food in inventory
for (const foodName of ['cooked_porkchop', 'cooked_beef', 'cooked_mutton', 'bread', 'apple']) {
  if (lib.count(foodName) > 0) {
    console.log(`Eating ${foodName}...`);
    try {
      if (typeof safeEat === 'function') await safeEat(foodName);
      else await lib.eat();
    } catch (e) {}
  }
}

// 4. Scan lava and obsidian around meeting spot
const lavas = bot.findBlocks({ matching: b => b.name === 'lava', maxDistance: 24, count: 50 });
const obs = bot.findBlocks({ matching: b => b.name === 'obsidian', maxDistance: 24, count: 20 });
console.log(`At meeting spot: ${lavas.length} lava blocks, ${obs.length} obsidian blocks.`);

// 5. Check Beta
if (bot.players.beta?.entity) {
  const b = bot.players.beta.entity;
  console.log('Beta pos:', lib.fmt(b.position), 'held:', b.heldItem?.name);
}

bot.chat(`beta: Standing next to you at lava lake! Obsidian in sight: ${obs.length}, Obsidian in inv: ${lib.count('obsidian')}. Quench and mine 10 obsidian!`);

console.log('Alpha status:', JSON.stringify(lib.status()));
