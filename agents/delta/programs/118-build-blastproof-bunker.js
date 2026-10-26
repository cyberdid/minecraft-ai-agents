// programs/118-build-blastproof-bunker.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

const blockName = lib.count('andesite') > 0 ? 'andesite' : 'granite';
console.log(`Using building block: ${blockName}. Available: ${lib.count(blockName)}`);

// Place helper that verifies placement
async function placeBlock(name, x, y, z) {
  const target = new Vec3(x, y, z);
  const current = bot.blockAt(target);
  if (current && current.name !== 'air' && current.name !== 'cave_air') {
    return 'already_solid';
  }
  
  // Choose block item
  const item = lib.count('andesite') > 0 ? 'andesite' : 'granite';
  try {
    const res = await lib.place(item, x, y, z);
    console.log(`Placed ${item} at (${x}, ${y}, ${z}): ${res}`);
    await sleep(150);
    return res;
  } catch (err) {
    console.log(`Failed place at (${x}, ${y}, ${z}):`, err.message);
    return 'error';
  }
}

// Ensure player is standing on safe floor at (44, 65, -129)
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -129));
} catch (e) {
  console.log('Path note:', e.message);
}

// 1. Lower walls at Y=65 (attached to floor at Y=64)
console.log('--- Step 1: Lower walls Y=65 ---');
const lowerWallTargets = [
  // West wall
  [43, 65, -128],
  // East wall
  [45, 65, -128],
  // North wall
  [43, 65, -130],
  [45, 65, -130],
  // South corners
  [43, 65, -127],
  [45, 65, -127]
];

for (const [x, y, z] of lowerWallTargets) {
  await placeBlock(blockName, x, y, z);
}

// 2. Upper walls at Y=66 (attached on top of Y=65)
console.log('--- Step 2: Upper walls Y=66 ---');
const upperWallTargets = [
  // West wall
  [43, 66, -128],
  // East wall
  [45, 66, -128],
  // North wall
  [43, 66, -130],
  [45, 66, -130],
  // South corners
  [43, 66, -127],
  [45, 66, -127]
];

for (const [x, y, z] of upperWallTargets) {
  await placeBlock(blockName, x, y, z);
}

// 3. Roof at Y=67 (attached on top of Y=66 walls)
console.log('--- Step 3: Roof Y=67 ---');
const roofTargets = [
  // Over walls first
  [43, 67, -130], [45, 67, -130],
  [43, 67, -129], [45, 67, -129],
  [43, 67, -128], [45, 67, -128],
  [43, 67, -127], [45, 67, -127],
  // Lintel over South doorway (44, 67, -127) - anti-wither skeleton & ghast shield
  [44, 67, -127],
  // Center roof bridging inwards
  [44, 67, -130],
  [44, 67, -129],
  [44, 67, -128]
];

for (const [x, y, z] of roofTargets) {
  await placeBlock(blockName, x, y, z);
}

// 4. Place a torch inside the bunker at (43, 66, -129) or (45, 66, -129) if dark
if (lib.count('torch') > 0) {
  try {
    console.log('Placing torch inside bunker...');
    await lib.place('torch', 44, 66, -130);
  } catch (e) {
    console.log('Torch note:', e.message);
  }
}

console.log('Delta inventory now:', JSON.stringify(lib.inv()));
bot.chat('delta: Built blast-proof cobblestone/andesite walls & roof for Fortress Workshop Bunker at (44, 65, -129)! Safe against Ghasts and Wither Skeletons.');
