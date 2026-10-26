// programs/150-sleep-and-morning-rearm.js
console.log('--- SLEEP THROUGH DUSK & RE-ARM AT DAWN ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// 1. Wait until canSleep is true (12542 ticks)
console.log('Waiting for sleep window...');
while (!lib.time().canSleep && !isCancelled()) {
  await sleep(1000);
}

console.log('canSleep is true! Entering bed...');
bot.chat('Dusk here! gamma sleeping in base bed to skip night.');

try {
  const res = await lib.sleepInBed();
  console.log('sleepInBed:', res);
} catch (e) {
  console.log('sleep error:', e.message);
  const bed = bot.findBlock({ matching: b => bot.isABed(b), maxDistance: 4 });
  if (bed) {
    try { await bot.sleep(bed); } catch (err) { console.log('bot.sleep err:', err.message); }
  }
}

// 2. Wait for dawn (timeOfDay < 12000 or phase === 'day')
const t0 = Date.now();
while (Date.now() - t0 < 35000 && !isCancelled()) {
  await sleep(1000);
  const t = lib.time();
  if (t.timeOfDay < 12000 || t.phase === 'day') {
    console.log(`Morning achieved! timeOfDay=${t.timeOfDay}, phase=${t.phase}`);
    break;
  }
}

bot.chat(`gamma awake at base! Time: ${lib.time().timeOfDay}. Commencing morning re-arm and Nether advance.`);

// 3. Step outside to (294, 72, -50) to gather 4 logs
console.log('Moving outside to gather wood...');
try {
  await lib.goTo(294, 72, -50, 1, { timeoutMs: 15000 });
} catch (e) {}

// Collect 4 logs
try {
  console.log('Collecting 4 birch/oak logs...');
  await lib.collect('*_log', 4, { maxDistance: 32 });
} catch (e) {
  console.log('collect log error:', e.message);
}

console.log('Inv after logs:', JSON.stringify(lib.inv()));

// Craft planks, table, sticks, wooden pickaxe
await lib.craft('*_planks', 12);
await lib.craft('stick', 4);
await lib.craft('crafting_table', 1);
await lib.craft('wooden_pickaxe', 1);

// Mine 14 stone for stone sword + stone pickaxe + cobblestone
console.log('Mining stone for stone tools...');
try {
  await lib.collect('stone', 12, { maxDistance: 16 });
} catch (e) {
  console.log('collect stone error:', e.message);
}

// Craft stone tools
if (lib.count('cobblestone') >= 2) await lib.craft('stone_sword', 1);
if (lib.count('cobblestone') >= 3) await lib.craft('stone_pickaxe', 1);

console.log('Final morning inv:', JSON.stringify(lib.inv()));
console.log('Gear:', JSON.stringify(lib.tools()));
bot.chat(`gamma re-armed with stone tools and ${lib.count('cobblestone')} cobblestone! Heading to Nether.`);
