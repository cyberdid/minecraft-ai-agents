// programs/251-ascend-to-base-and-prepare-portal.js
console.log('=== Program 251: Ascend to Base & Prepare Portal Site ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Night in:', lib.time().secondsUntilNight);

// 1. Ascend safe staircase to surface
const upStages = [
  { x: 338, y: 47, z: -70 },
  { x: 345, y: 65, z: -40 },
  { x: 298, y: 72, z: -54 }
];

for (let i = 0; i < upStages.length; i++) {
  if (isCancelled()) break;
  const target = upStages[i];
  console.log(`Ascending to stage ${i+1}/${upStages.length}: (${target.x}, ${target.y}, ${target.z})...`);
  try {
    await lib.goTo(target.x, target.y, target.z, 2, { dig: true, timeoutMs: 25000 });
    console.log(`Reached stage ${i+1}! Pos:`, lib.fmt(bot.entity.position));
  } catch (err) {
    console.log(`Stage ${i+1} note:`, err.message);
  }
}

// 2. Enter base if near
console.log('Heading into base...');
try {
  await lib.goTo(294, 72, -52, 2, { timeoutMs: 15000 });
  if (typeof passDoorIn === 'function') await passDoorIn();
  else await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
  await lib.door(294, 72, -54, false).catch(() => {});
} catch (e) {
  console.log('Base entry note:', e.message);
}

// 3. Inspect base chest
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Base chest items:', JSON.stringify(contents));
  // Eat if any food
  for (const f of ['cooked_mutton', 'cooked_porkchop', 'bread', 'apple']) {
    if (contents[f] > 0) {
      await lib.withdraw({ [f]: contents[f] }, chestPos.x, chestPos.y, chestPos.z);
      if (typeof safeEat === 'function') await safeEat(f);
      else await lib.eat();
    }
  }
} catch (e) {}

// 4. Inspect portal frame requirements at (298, 72, -54)
const frame = lib.shapes.portal(298, 72, -54, 'x');
const mat = lib.materials(frame);
console.log('Portal frame status:', JSON.stringify(mat));

bot.chat(`beta: Alpha waiting at base portal site (298, 72, -54)! Frame needs: ${JSON.stringify(mat.missing)}. Bring the 10 obsidian here!`);
console.log('Status:', JSON.stringify(lib.status()));
