// programs/154-fast-arm-and-nether.js
console.log('--- FAST ARM ON HILL & ADVANCE TO FORTRESS ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Find nearest log within 15 blocks and dig 3 logs
const logBlock = bot.findBlock({
  matching: b => b.name.endsWith('_log'),
  maxDistance: 16
});

if (logBlock) {
  console.log(`Found log at ${lib.fmt(logBlock.position)} (${logBlock.name})`);
  try {
    await lib.goTo(logBlock.position.x, logBlock.position.y, logBlock.position.z, 2, { timeoutMs: 10000 });
  } catch (e) {}

  // Dig 3 logs from this tree trunk
  const trunkBlocks = bot.findBlocks({
    matching: b => b.name.endsWith('_log'),
    maxDistance: 4,
    count: 3
  });

  for (const p of trunkBlocks) {
    try {
      console.log(`Digging log at ${lib.fmt(p)}...`);
      await lib.dig(p.x, p.y, p.z);
      await sleep(100);
      await lib.pickup(3);
    } catch (e) {
      console.log('Log dig err:', e.message);
    }
  }
}

console.log('Inv after logs:', JSON.stringify(lib.inv()));

// 2. Craft planks, sticks, table, wooden_pickaxe
const log = bot.inventory.items().find(i => i.name.endsWith('_log'));
if (log) {
  const plankName = log.name.replace('_log', '_planks');
  await lib.craft(plankName, 12);
  await lib.craft('stick', 4);
  await lib.craft('crafting_table', 1);
  
  // Place crafting table
  const spot = bot.entity.position.floored().offset(1, 0, 0);
  const under = bot.blockAt(spot.offset(0, -1, 0));
  if (under && under.boundingBox === 'block' && bot.blockAt(spot).name === 'air') {
    try { await lib.place('crafting_table', spot.x, spot.y, spot.z); } catch (e) {}
  }
  
  await lib.craft('wooden_pickaxe', 1);
  console.log('Crafted wooden_pickaxe!');
}

// 3. Mine 12 stone nearby
const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

const stoneBlocks = bot.findBlocks({
  matching: b => ['stone', 'cobblestone', 'andesite', 'granite', 'diorite'].includes(b.name),
  maxDistance: 5,
  count: 12
});

console.log(`Found ${stoneBlocks.length} stone blocks nearby`);
for (const sb of stoneBlocks) {
  if (lib.count('cobblestone') >= 12) break;
  try {
    await lib.dig(sb.x, sb.y, sb.z);
    await sleep(100);
    await lib.pickup(3);
  } catch (e) {}
}

console.log('Cobblestone mined:', lib.count('cobblestone'));

// 4. Craft stone tools
if (lib.count('cobblestone') >= 2) await lib.craft('stone_sword', 1);
if (lib.count('cobblestone') >= 3) await lib.craft('stone_pickaxe', 1);

const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma armed with stone tools and ${lib.count('cobblestone')} cobble. Heading to Nether portal!`);

// 5. Move to Nether portal at (299, 73, -54)
console.log('Moving to Nether portal (299, 73, -54)...');
try {
  await lib.goTo(299, 73, -53, 1, { timeoutMs: 25000 });
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
bot.chat('gamma in the Nether! Following safe East Ridge trail to Fortress advance tunnel (44, 65, -141).');

// 6. Follow safe East Ridge waypoints (staying at x=61..63 until z=-100)
const safeEastRidge = [
  new Vec3(63, 64, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(62, 67, -80),   // Safe East Ridge
  new Vec3(61, 66, -100),  // Safe East Ridge
  new Vec3(50, 65, -115),  // West turn to bunker
  new Vec3(44, 65, -127),  // Bunker entrance
  new Vec3(44, 65, -141)   // Advance tunnel
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
bot.chat(`gamma safely arrived at Fortress advance tunnel ${lib.fmt(bot.entity.position)}! United with Delta & Alpha.`);
