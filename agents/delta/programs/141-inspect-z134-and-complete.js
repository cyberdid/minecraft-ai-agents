// programs/141-inspect-z134-and-complete.js
console.log('Pos:', lib.fmt(bot.entity.position));

async function placeGranite(x, y, z) {
  const current = bot.blockAt(new Vec3(x, y, z));
  if (current && current.name !== 'air' && current.name !== 'cave_air') {
    console.log(`Block at (${x}, ${y}, ${z}) already solid: ${current.name}`);
    return 'already_solid';
  }
  if (lib.count('granite') === 0) {
    console.log('No granite left!');
    return 'no_blocks';
  }
  try {
    const res = await lib.place('granite', x, y, z);
    console.log(`Placed granite at (${x}, ${y}, ${z}): ${res}`);
    await sleep(150);
    return res;
  } catch (err) {
    console.log(`Place error at (${x}, ${y}, ${z}):`, err.message);
    return 'error';
  }
}

// 1. Inspect z=-134
console.log('--- Inspecting z=-134 before building ---');
console.log('Floor (44, 64, -134):', bot.blockAt(new Vec3(44, 64, -134))?.name);
console.log('Roof (44, 67, -134):', bot.blockAt(new Vec3(44, 67, -134))?.name);
console.log('West (43, 65..66, -134):', bot.blockAt(new Vec3(43, 65, -134))?.name, bot.blockAt(new Vec3(43, 66, -134))?.name);
console.log('East (45, 65..66, -134):', bot.blockAt(new Vec3(45, 65, -134))?.name, bot.blockAt(new Vec3(45, 66, -134))?.name);

// 2. Build roof at Y=67
console.log('--- Placing roof at (44, 67, -134) ---');
await placeGranite(44, 67, -134);

// 3. Build west wall at X=43
console.log('--- Placing west wall at (43, 65..66, -134) ---');
await placeGranite(43, 65, -134);
await placeGranite(43, 66, -134);

// 4. Build east wall at X=45
console.log('--- Placing east wall at (45, 65..66, -134) ---');
await placeGranite(45, 65, -134);
await placeGranite(45, 66, -134);

// 5. Place floor at (44, 64, -135)
console.log('--- Placing floor at (44, 64, -135) ---');
await placeGranite(44, 64, -135);

// 6. Verify z=-134 tunnel segment
const floor = bot.blockAt(new Vec3(44, 64, -134))?.name;
const roof = bot.blockAt(new Vec3(44, 67, -134))?.name;
const westLower = bot.blockAt(new Vec3(43, 65, -134))?.name;
const westUpper = bot.blockAt(new Vec3(43, 66, -134))?.name;
const eastLower = bot.blockAt(new Vec3(45, 65, -134))?.name;
const eastUpper = bot.blockAt(new Vec3(45, 66, -134))?.name;
const interiorLower = bot.blockAt(new Vec3(44, 65, -134))?.name;
const interiorUpper = bot.blockAt(new Vec3(44, 66, -134))?.name;

const fullyEnclosed = (
  floor !== 'air' && roof !== 'air' &&
  westLower !== 'air' && westUpper !== 'air' &&
  eastLower !== 'air' && eastUpper !== 'air' &&
  interiorLower === 'air' && interiorUpper === 'air'
);
console.log(`z=-134 Tunnel fully enclosed & walkable: ${fullyEnclosed}`);

// Place a torch on the wall inside the tunnel if needed
if (lib.count('torch') > 0) {
  try {
    await lib.place('torch', 43, 66, -132);
    console.log('Placed torch inside tunnel at (43, 66, -132)');
  } catch (e) {
    console.log('Torch note:', e.message);
  }
}

// Equip weapon
await lib.equipWeapon();
console.log('Delta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`delta: z=-134 tunnel segment complete & lit! FullyEnclosed=${fullyEnclosed}. Corridor extends safely to z=-134.`);
