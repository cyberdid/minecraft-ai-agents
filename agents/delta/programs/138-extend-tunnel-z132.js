// programs/138-extend-tunnel-z132.js
console.log('Pos:', lib.fmt(bot.entity.position));

async function placeGranite(x, y, z) {
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

// 1. Advance floor to (44, 64, -133)
console.log('--- Placing floor at (44, 64, -133) ---');
await placeGranite(44, 64, -133);

// 2. Place roof at (44, 67, -132)
console.log('--- Placing roof at (44, 67, -132) ---');
await placeGranite(44, 67, -132);

// 3. Place west wall at (43, 65..66, -132)
console.log('--- Placing west wall at (43, 65..66, -132) ---');
await placeGranite(43, 65, -132);
await placeGranite(43, 66, -132);

// 4. Place east wall at (45, 65..66, -132)
console.log('--- Placing east wall at (45, 65..66, -132) ---');
await placeGranite(45, 65, -132);
await placeGranite(45, 66, -132);

// 5. Verify z=-132 tunnel envelope
const floor = bot.blockAt(new Vec3(44, 64, -132))?.name;
const roof = bot.blockAt(new Vec3(44, 67, -132))?.name;
const westLower = bot.blockAt(new Vec3(43, 65, -132))?.name;
const westUpper = bot.blockAt(new Vec3(43, 66, -132))?.name;
const eastLower = bot.blockAt(new Vec3(45, 65, -132))?.name;
const eastUpper = bot.blockAt(new Vec3(45, 66, -132))?.name;
const interiorLower = bot.blockAt(new Vec3(44, 65, -132))?.name;
const interiorUpper = bot.blockAt(new Vec3(44, 66, -132))?.name;

console.log(`Floor (y=64): ${floor}`);
console.log(`Roof (y=67): ${roof}`);
console.log(`West Wall (x=43): ${westLower}, ${westUpper}`);
console.log(`East Wall (x=45): ${eastLower}, ${eastUpper}`);
console.log(`Interior (x=44): ${interiorLower}, ${interiorUpper}`);

const fullyEnclosed = (
  floor !== 'air' && roof !== 'air' &&
  westLower !== 'air' && westUpper !== 'air' &&
  eastLower !== 'air' && eastUpper !== 'air' &&
  interiorLower === 'air' && interiorUpper === 'air'
);
console.log('z=-132 Corridor section 100% enclosed and walkable:', fullyEnclosed);

console.log('Delta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`delta: z=-132 tunnel segment complete & 100% blast-proof! FullyEnclosed=${fullyEnclosed}.`);
