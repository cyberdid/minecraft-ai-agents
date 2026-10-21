// programs/025-craft-stone-pick-and-find-dry-iron.js
// Get up, check for burning zombie, mine 15 stone for stone pickaxes, scan dry iron ore

console.log('alpha at:', lib.fmt(bot.entity.position));

// Wake from bed if needed
try {
  await bot.wake();
  await sleep(300);
} catch (e) {}

// Wait 10s for daylight to finish off burning surface zombies
console.log('Waiting 10s for surface mobs to burn in sunlight...');
await sleep(10000);

const hostiles = lib.hostiles(16);
console.log('Hostiles within 16 now:', JSON.stringify(hostiles));

// Step outside door
const doorPos = new Vec3(294, 72, -54);
let doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Stepping outside to (294, -51)...');
await lib.walkTo(294, -51);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}

// 1. Mine 15 stone with wooden pickaxe to get cobblestone
console.log('Mining 15 stone for tools...');
try {
  const gotStone = await lib.collect('stone', 15);
  console.log('Stone mined:', JSON.stringify(gotStone));
} catch (e) {
  console.log('Stone collect note:', e.message);
}

console.log('Cobblestone count:', lib.count('cobblestone'));

// 2. Craft sticks and stone pickaxes
if (lib.count('stick') < 4) {
  await lib.craft('stick', 4);
}
if (lib.count('cobblestone') >= 6) {
  await lib.craft('stone_pickaxe', 2);
  console.log('Crafted 2 stone pickaxes!');
}

// 3. Scan for iron ore with y >= 62 (safe, dry, away from water cave)
const allIron = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 64, count: 30 });
const dryIron = allIron.filter(b => b.position.y >= 62);
console.log(`Found ${allIron.length} total iron blocks, ${dryIron.length} are dry (y >= 62)`);
dryIron.forEach(i => console.log(`  dry iron at ${lib.fmt(i.position)} dist: ${bot.entity.position.distanceTo(i.position).toFixed(1)}`));

// 4. If dry iron found, collect up to 15 raw iron
if (dryIron.length > 0) {
  bot.chat(`alpha: Found ${dryIron.length} dry iron ores on hillside. Mining now.`);
  console.log('Mining dry iron ore...');
  for (const ore of dryIron) {
    if (isCancelled()) break;
    try {
      console.log(`Digging iron at ${lib.fmt(ore.position)}...`);
      await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2);
      await lib.dig(ore.position.x, ore.position.y, ore.position.z);
      await lib.pickup(4);
    } catch (e) {
      console.log(`Dig ore error at ${lib.fmt(ore.position)}:`, e.message);
    }
    if (lib.count('raw_iron') >= 15) break;
  }
}

console.log('Raw iron count:', lib.count('raw_iron'));

// Return to base doorstep
console.log('Returning to base doorstep...');
await lib.goTo(294, 72, -52, 1);

// Step inside
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
await lib.walkTo(294, -56);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

const time = lib.time();
console.log('Night in:', time.secondsUntilNight, 's');

return {
  rawIron: lib.count('raw_iron'),
  cobblestone: lib.count('cobblestone'),
  stonePickaxes: lib.count('stone_pickaxe'),
  time: time.secondsUntilNight
};
