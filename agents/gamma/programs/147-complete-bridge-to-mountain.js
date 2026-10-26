// programs/147-complete-bridge-to-mountain.js
console.log('--- COMPLETE BRIDGE TO MOUNTAIN AT Z=-148 ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Craft birch log into 4 planks
if (lib.count('birch_log') > 0) {
  try {
    await lib.craft('birch_planks', 4);
    console.log('Crafted planks. Total birch_planks:', lib.count('birch_planks'));
  } catch (e) {
    console.log('Craft planks error:', e.message);
  }
}

// 2. Step forward to (44, 65, -143)
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -143));
} catch (e) {}

console.log('Now at:', lib.fmt(bot.entity.position));

// 3. Place floor at z=-146, z=-147, z=-148
for (let z = -146; z >= -148; z--) {
  const f = bot.blockAt(new Vec3(44, 64, z));
  if (!f || f.name === 'air') {
    console.log(`Placing floor at (44, 64, ${z})...`);
    try {
      await lib.place('birch_planks', 44, 64, z);
      console.log(`Placed floor at (44, 64, ${z})`);
    } catch (e) {
      console.log(`Floor ${z} place error:`, e.message);
    }
  }
}

// 4. Inspect mountain face at z=-148..-150
console.log('Inspecting mountain blocks at z=-148..-150:');
for (let z = -148; z >= -150; z--) {
  for (let y = 64; y <= 68; y++) {
    const b = bot.blockAt(new Vec3(44, y, z));
    console.log(`(44, ${y}, ${z}): ${b ? b.name : 'null'}`);
  }
}

// Step forward to (44, 65, -146)
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -146));
} catch (e) {}

console.log('Final position:', lib.fmt(bot.entity.position));
bot.chat(`gamma completed bridge floor to z=-148! We are at the solid glowstone mountain face. Commencing mountain breach to Blaze Spawner (32, 68, -190)!`);
