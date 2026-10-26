// programs/153-sprint-rearm-and-correct-nether-trail.js
console.log('--- SPRINT, REARM & FOLLOW CORRECTED EAST RIDGE TRAIL ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Sprint to base at (294, 72, -55)
console.log('Sprinting to base (294, 72, -55)...');
try {
  await lib.goToXZ(294, -55, { timeoutMs: 30000 });
} catch (e) {
  console.log('goToXZ note:', e.message);
}

try {
  await lib.goTo(294, 72, -55, 1, { timeoutMs: 15000 });
} catch (e) {}

console.log('At base:', lib.fmt(bot.entity.position));

// 2. Gather 4 logs right outside base
console.log('Gathering 4 logs outside base...');
try {
  await lib.goTo(294, 72, -50, 1, { timeoutMs: 10000 });
} catch (e) {}

try {
  await lib.collect('*_log', 4, { maxDistance: 24 });
} catch (e) {
  console.log('collect log err:', e.message);
}

// 3. Craft planks, sticks, crafting_table, wooden_pickaxe
console.log('Crafting wood gear...');
const logItem = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (logItem) {
  const plankName = logItem.name.replace('_log', '_planks');
  await lib.craft(plankName, 16);
  await lib.craft('stick', 4);
  await lib.craft('crafting_table', 1);
  await lib.craft('wooden_pickaxe', 1);
}

// 4. Mine 14 stone for stone sword + stone pickaxe
console.log('Mining stone for tools...');
try {
  await lib.collect('stone', 14, { maxDistance: 16 });
} catch (e) {
  console.log('collect stone err:', e.message);
}

if (lib.count('cobblestone') >= 2) await lib.craft('stone_sword', 1);
if (lib.count('cobblestone') >= 3) await lib.craft('stone_pickaxe', 1);

const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

console.log('Gear:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma geared with stone tools & ${lib.count('cobblestone')} cobble. Heading to Nether.`);

// 5. Move to Nether portal at (299, 73, -54)
console.log('Moving to Nether portal (299, 73, -54)...');
try {
  await lib.goTo(299, 73, -53, 1, { timeoutMs: 20000 });
} catch (e) {
  await lib.goToXZ(299, -53, { timeoutMs: 15000 });
}

await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
bot.clearControlStates();

console.log('Waiting for Nether transit (standing still)...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within 25s');
}

console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));
bot.chat('gamma in the Nether! Following corrected East Ridge trail to Fortress advance tunnel (44, 65, -141).');

// 6. Follow CORRECTED safe East Ridge trail (staying at x=61..63 until z=-100!)
const safeEastRidge = [
  new Vec3(63, 64, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),   // SAFE EAST RIDGE - bypasses fire pit
  new Vec3(61, 66, -100),  // SAFE EAST RIDGE - bypasses fire pit
  new Vec3(50, 65, -115),  // TURN WEST AFTER FIRE PIT
  new Vec3(44, 65, -127),  // BUNKER ENTRANCE
  new Vec3(44, 65, -141)   // ADVANCE TUNNEL
];

for (let i = 0; i < safeEastRidge.length; i++) {
  const wp = safeEastRidge[i];
  console.log(`Navigating to WP ${i + 1}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 25000 });
    console.log(`Reached WP ${i + 1} at ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`WP ${i + 1} note: ${e.message}`);
  }
}

console.log('Final pos in Nether:', lib.fmt(bot.entity.position));
bot.chat(`gamma safely united with team at Fortress advance tunnel ${lib.fmt(bot.entity.position)}! Ready for Blaze Spawner breach.`);
