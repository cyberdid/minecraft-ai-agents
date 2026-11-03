// programs/861-plug-water-and-dig-through.js
console.log('=== Program 861: Plug Water & Dig Through to Open Lava Cave ===');
globalThis.isProgramCancelled = isCancelled;

const p = bot.entity.position;
console.log(`Current pos: ${lib.fmt(p)}`);

// Equip pickaxe
const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// 1. Stand at (291, 19, 7)
try {
  await lib.goTo(291, 19, 7, 0.8, { timeoutMs: 5000 });
} catch (e) {}

// 2. Plug water flow at (289, 20, 7) and (289, 19, 7) with cobblestone
const waterSpots = [new Vec3(289, 20, 7), new Vec3(289, 19, 7), new Vec3(290, 19, 7)];
for (const wp of waterSpots) {
  const b = bot.blockAt(wp);
  if (b && (b.name === 'water' || b.name === 'flowing_water')) {
    console.log(`Plugging water at ${lib.fmt(wp)} with cobblestone...`);
    try {
      await lib.place('cobblestone', wp.x, wp.y, wp.z);
    } catch (err) {
      console.log(`Place error at ${lib.fmt(wp)}: ${err.message}`);
    }
  }
}

// 3. Dig through stone obstruction at x=287 (y=19 and y=20 at z=7)
const toDig = [
  new Vec3(288, 19, 7),
  new Vec3(288, 20, 7),
  new Vec3(287, 19, 7),
  new Vec3(287, 20, 7)
];

for (const dp of toDig) {
  const b = bot.blockAt(dp);
  if (b && b.boundingBox === 'block') {
    console.log(`Digging block at ${lib.fmt(dp)} (${b.name})...`);
    try {
      if (pick) await bot.equip(pick, 'hand');
      await bot.dig(b);
      await sleep(300);
    } catch (e) {
      console.log(`Dig error at ${lib.fmt(dp)}: ${e.message}`);
    }
  }
}

// 4. Inspect open cave ahead at x=286..281
console.log('Inspecting cave ahead at x=286..281:');
const sources = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 12,
  count: 10
});

console.log(`Found ${sources.length} true lava sources ahead:`);
for (const s of sources) {
  const up = bot.blockAt(s.offset(0, 1, 0));
  console.log(`  Source at ${lib.fmt(s)} (above: ${up ? up.name : 'null'}, dist: ${bot.entity.position.distanceTo(s).toFixed(1)}m)`);
}

return {
  pos: bot.entity.position,
  lavaSources: sources.length
};
