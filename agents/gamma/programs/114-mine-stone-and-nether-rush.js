// programs/114-mine-stone-and-nether-rush.js
console.log('--- MINE STONE ON HILL & NETHER RUSH ---');
console.log('Pos:', lib.fmt(bot.entity.position));

await bot.equip(mcData.itemsByName.wooden_pickaxe.id, 'hand');

// 1. Dig stone right on the hillside
// First clear dirt block in front if needed
const digTargets = [
  new Vec3(299, 76, -25),
  new Vec3(299, 75, -25),
  new Vec3(300, 76, -25),
  new Vec3(300, 75, -25),
  new Vec3(298, 76, -25),
  new Vec3(298, 75, -25),
  new Vec3(299, 74, -25),
  new Vec3(300, 74, -25)
];

for (const p of digTargets) {
  if (lib.count('cobblestone') >= 10) break;
  const b = bot.blockAt(p);
  if (b && (b.name === 'stone' || b.name === 'dirt' || b.name === 'grass_block' || b.name === 'granite' || b.name === 'diorite')) {
    try {
      console.log(`Mining ${b.name} at ${lib.fmt(p)}...`);
      await lib.dig(p.x, p.y, p.z);
      await sleep(150);
      await lib.pickup(4);
    } catch (e) {}
  }
}

console.log('Cobblestone count:', lib.count('cobblestone'));

// 2. Craft stone tools
if (lib.count('cobblestone') >= 5) {
  console.log('Crafting stone tools...');
  try {
    await lib.craft('stone_sword', 1);
    await lib.craft('stone_pickaxe', 1);
    await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');
    console.log('Equipped stone_sword!');
  } catch (e) {
    console.log('Craft note:', e.message);
  }
}

console.log('Tools now:', JSON.stringify(lib.tools()));
console.log('Inv now:', JSON.stringify(lib.inv()));
bot.chat(`gamma armed on hillside! Heading straight along x=299 to Nether portal.`);

// 3. Walk along x=299 south to portal at (299, 73, -53)
console.log('Navigating south along x=299 to portal (299, 73, -53)...');
try {
  await lib.goTo(299, 73, -53, 1, { timeoutMs: 25000 });
} catch (e) {
  console.log('Portal goTo note:', e.message);
  await lib.goToXZ(299, -53, { timeoutMs: 15000 });
}

// 4. Step directly into purple portal block at (299, 73, -54)
console.log('Stepping into purple portal block at (299, 73, -54)...');
await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));

console.log('Waiting for Nether transit...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 30000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within 30s');
}

console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));
bot.chat('gamma in the Nether! Advancing via East Ridge trail (x=63) to join team at Fortress tunnel (44, 65, -134).');

// 5. Navigate safe East Ridge Trail to Fortress Workshop (44, 65, -128)
console.log('Moving to Waypoint 1 (50, 65, -35)...');
try {
  await lib.goTo(50, 65, -35, 3, { timeoutMs: 20000 });
} catch (e) {}

console.log('Moving to Waypoint 2 on East Ridge at (63, 65, -66)...');
try {
  await lib.goTo(63, 65, -66, 3, { timeoutMs: 25000 });
  console.log('Safely on East Ridge! Pos:', lib.fmt(bot.entity.position));
} catch (e) {}

console.log('Moving to Fortress Workshop doorway (44, 65, -128)...');
try {
  await lib.goTo(44, 65, -128, 1, { timeoutMs: 30000 });
  console.log('ARRIVED AT FORTRESS WORKSHOP!');
} catch (e) {}

// Move into Delta advance hallway (44, 65, -134)
console.log('Entering Delta advance hallway (44, 65, -134)...');
try {
  await lib.goTo(44, 65, -134, 1, { timeoutMs: 15000 });
  console.log('WITH DELTA AT ADVANCE HALLWAY!');
} catch (e) {}

// Report team
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}`);
  }
}

bot.chat(`gamma with Delta at Fortress advance tunnel ${lib.fmt(bot.entity.position)}! Ready to breach Blaze Spawner (32, 68, -190).`);
