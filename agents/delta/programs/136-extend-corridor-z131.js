// programs/136-extend-corridor-z131.js
console.log('Pos:', lib.fmt(bot.entity.position));

async function tryPlace(name, x, y, z) {
  const current = bot.blockAt(new Vec3(x, y, z));
  if (current && current.name !== 'air' && current.name !== 'cave_air') {
    return 'already_solid';
  }
  const item = lib.count('andesite') > 0 ? 'andesite' : 'granite';
  try {
    const res = await lib.place(item, x, y, z);
    console.log(`Placed ${item} at (${x}, ${y}, ${z}): ${res}`);
    await sleep(150);
    return res;
  } catch (err) {
    console.log(`Place error at (${x}, ${y}, ${z}):`, err.message);
    return 'error';
  }
}

// 1. Extend floor to (44, 64, -132) next to (44, 64, -131) and (45, 64, -132)
console.log('--- Placing floor at (44, 64, -132) ---');
await tryPlace('granite', 44, 64, -132);

// 2. Extend roof at Y=67
console.log('--- Placing roof blocks at Y=67 ---');
await tryPlace('granite', 44, 67, -131);
await tryPlace('granite', 45, 67, -131);

// 3. Extend west wall at X=43
console.log('--- Placing west wall at X=43 ---');
await tryPlace('granite', 43, 65, -131);
await tryPlace('granite', 43, 66, -131);

// 4. Extend east wall at X=46
console.log('--- Placing east wall at X=46 ---');
await tryPlace('granite', 46, 65, -131);
await tryPlace('granite', 46, 66, -131);

// Check inventory
console.log('Delta inventory now:', JSON.stringify(lib.inv()));
bot.chat('delta: Extended fortified corridor North at z=-131! Floor, walls, and roof secure.');
