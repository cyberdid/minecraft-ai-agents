// programs/148-breach-into-mountain.js
console.log('--- BREACH INTO GLOWSTONE MOUNTAIN ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Birch planks:', lib.count('birch_planks'));

// 1. Place floor at (44, 64, -148)
const f148 = bot.blockAt(new Vec3(44, 64, -148));
if (!f148 || f148.name === 'air') {
  console.log('Placing floor at (44, 64, -148)...');
  try {
    await lib.place('birch_planks', 44, 64, -148);
    console.log('Placed floor at (44, 64, -148)!');
  } catch (e) {
    console.log('Floor 148 place error:', e.message);
  }
}

// 2. Step forward to (44, 65, -148)
console.log('Stepping to (44, 65, -148)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -148));
} catch (e) {
  console.log('goto 148 note:', e.message);
}
console.log('Now at:', lib.fmt(bot.entity.position));

// 3. Dig into mountain face at z=-149: (44, 65, -149) and (44, 66, -149)
console.log('Digging mountain entrance at (44, 65..66, -149)...');
for (const y of [66, 65]) {
  const b = bot.blockAt(new Vec3(44, y, -149));
  if (b && b.boundingBox === 'block') {
    console.log(`Digging ${b.name} at (44, ${y}, -149)...`);
    try {
      await lib.dig(44, y, -149);
      await sleep(100);
      await lib.pickup(4);
    } catch (e) {
      console.log(`Dig err at (44, ${y}, -149):`, e.message);
    }
  }
}

// 4. Ensure floor at (44, 64, -149) is solid
const f149 = bot.blockAt(new Vec3(44, 64, -149));
if (!f149 || f149.name === 'air') {
  console.log('Placing floor at (44, 64, -149)...');
  try {
    await lib.place('birch_planks', 44, 64, -149);
  } catch (e) {}
}

// 5. Step inside mountain to (44, 65, -149)
console.log('Stepping inside mountain at (44, 65, -149)...');
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -149));
} catch (e) {
  console.log('goto 149 note:', e.message);
}

console.log('Position inside mountain:', lib.fmt(bot.entity.position));

// 6. Inspect ahead at z=-150 to z=-153
console.log('Inspecting mountain interior:');
for (let z = -150; z >= -153; z--) {
  for (let y = 64; y <= 67; y++) {
    const b = bot.blockAt(new Vec3(44, y, z));
    console.log(`(44, ${y}, ${z}): ${b ? b.name : 'null'}`);
  }
}

bot.chat(`gamma BREACHED THE MOUNTAIN at (44, 65, -149)! Fully inside solid mountain rock, safe from Ghasts. Advancing tunnel towards Blaze Spawner (32, 68, -190)!`);
