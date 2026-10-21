// programs/006-mine-stone-build-walls.js
// Mine remaining stone for walls and build cobblestone walls

console.log('Cobblestone before:', lib.count('cobblestone'));

// 1. Mine stone until we have at least 50 cobblestone
if (lib.count('cobblestone') < 50) {
  const needed = 52 - lib.count('cobblestone');
  console.log(`Mining ${needed} stone...`);
  try {
    const got = await lib.collect('stone', needed);
    console.log('Mined:', JSON.stringify(got));
  } catch (e) {
    console.log('Collect stone note:', e.message);
  }
}

console.log('Cobblestone now:', lib.count('cobblestone'));

// 2. Build the walls
const house = getBaseHouse();
const walls = house.filter(b => b.name === 'cobblestone');
console.log(`Walls total blocks: ${walls.length}`);

// Announce to beta
bot.chat(`alpha: Building cobblestone walls at (292, 72, -58) now. Planks/roof next.`);

const buildResult = await lib.build(walls, { replace: true });
console.log('Build result:', JSON.stringify(buildResult));

// 3. Craft furnace if we have enough cobblestone left
if (lib.count('furnace') === 0 && lib.count('cobblestone') >= 8) {
  try {
    await lib.craft('furnace', 1);
    console.log('Crafted furnace! Furnaces:', lib.count('furnace'));
  } catch (e) {
    console.log('Furnace craft note:', e.message);
  }
}

const time = lib.time();
console.log(`Night in: ${time.secondsUntilNight}s, phase: ${time.phase}`);

return {
  wallsResult: buildResult,
  cobbleLeft: lib.count('cobblestone'),
  furnace: lib.count('furnace'),
  time: time.secondsUntilNight
};
