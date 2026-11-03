// programs/373-ascend-to-surface-with-dig.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

// Ascend from (315, 47, -32) to surface base at (294, 72, -56)
// Using {dig: true} so pathfinder clears any ceiling/head collisions
console.log('Ascending to surface base (294, 72, -56) with dig: true...');

try {
  await lib.goTo(294, 72, -56, 1.5, { dig: true, timeoutMs: 35000 });
} catch (e) {
  console.log('lib.goTo note:', e.message);
  // Step-by-step staircase fallback
  const stairPoints = [
    new Vec3(310, 52, -36),
    new Vec3(306, 58, -40),
    new Vec3(303, 64, -43),
    new Vec3(302, 71, -44),
    new Vec3(294, 72, -56)
  ];
  for (const p of stairPoints) {
    console.log(`Climbing to ${lib.fmt(p)}...`);
    try {
      await lib.goTo(p.x, p.y, p.z, 1.5, { dig: true, timeoutMs: 10000 });
    } catch (err) {
      await bot.lookAt(new Vec3(p.x, p.y + 1, p.z), true);
      bot.setControlState('forward', true);
      bot.setControlState('jump', true);
      await sleep(2000);
      bot.clearControlStates();
    }
  }
}

console.log('At surface base! Pos:', lib.fmt(bot.entity.position));

// 1. Gather 2 logs from nearby tree
console.log('Gathering 2 logs for sticks and wood...');
try {
  await lib.collect('*_log', 2);
  console.log('Logs collected! Count:', lib.count('*_log'));
} catch (e) {
  console.log('Collect log note:', e.message);
}

// 2. Craft planks and sticks
const logs = bot.inventory.items().filter(i => i.name.endsWith('_log'));
for (const l of logs) {
  try { await lib.craft(l.name.replace('_log', '_planks'), l.count * 4); } catch (e) {}
}
if (lib.count('stick') < 4) try { await lib.craft('stick', 4); } catch (e) {}

// 3. Craft stone tools: stone_pickaxe and stone_sword from 19 cobblestone!
if (lib.count('cobblestone') >= 3 && lib.count('stone_pickaxe') === 0) {
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe crafted!');
  } catch (e) {}
}

if (lib.count('cobblestone') >= 2 && lib.count('*_sword') === 0) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted!');
  } catch (e) {}
}

const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) try { await bot.equip(sword, 'hand'); } catch (e) {}

console.log(`Delta rearmed: cobble=${lib.count('cobblestone')}, sword=${lib.count('*_sword')}`);

// 4. Enter Nether portal at (299.5, 73.0, -54.0)
console.log('Entering Nether portal at (299.5, 73.0, -54.0)...');
try {
  await lib.goTo(299, 73, -54, 0.5, { timeoutMs: 12000 });
} catch (e) {
  await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
  bot.setControlState('forward', true);
  await sleep(2000);
  bot.setControlState('forward', false);
}

// Await Nether dimension change
console.log('Awaiting Nether dimension change...');
const portalStart = Date.now();
while (!isCancelled() && bot.game.dimension !== 'the_nether' && Date.now() - portalStart < 15000) {
  await sleep(250);
}

console.log('Current dimension:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (bot.game.dimension !== 'the_nether') {
  console.log('Nether transit incomplete, retry.');
  return;
}

bot.chat(`delta: Armed with stone sword & ${lib.count('cobblestone')} cobble! Sprinting to Spawner Pillbox!`);
