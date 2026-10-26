// programs/138-fortify-bridge-to-142.js
console.log('--- FORTIFY BRIDGE SEGMENT BY SEGMENT ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Cobblestone:', lib.count('cobblestone'));

// 1. Inspect z=-134 and z=-135 closely
for (let z = -134; z >= -136; z--) {
  for (let y = 64; y <= 67; y++) {
    for (let x = 43; x <= 45; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      console.log(`(${x}, ${y}, ${z}): ${b ? b.name : 'null'}`);
    }
  }
}

// 2. Clear feet-level barrier at (44, 65, -135) if needed
const barrier = bot.blockAt(new Vec3(44, 65, -135));
if (barrier && barrier.name !== 'air') {
  console.log(`Clearing barrier at (44, 65, -135): ${barrier.name}`);
  await lib.dig(44, 65, -135);
}

// 3. Helper to fortify one z-slice: left wall, right wall, roof
async function fortifySlice(z) {
  console.log(`Fortifying slice z=${z}...`);
  // Floor at (44, 64, z) is already solid (birch_planks or netherrack)
  
  // Left wall: (43, 65, z) and (43, 66, z)
  for (const y of [65, 66]) {
    const cur = bot.blockAt(new Vec3(43, y, z));
    if (!cur || cur.name === 'air') {
      try {
        await lib.place('cobblestone', 43, y, z);
        console.log(`Placed left wall at (43, ${y}, ${z})`);
      } catch (e) {
        console.log(`Left wall (43, ${y}, ${z}) err: ${e.message}`);
      }
    }
  }

  // Right wall: (45, 65, z) and (45, 66, z)
  for (const y of [65, 66]) {
    const cur = bot.blockAt(new Vec3(45, y, z));
    if (!cur || cur.name === 'air') {
      try {
        await lib.place('cobblestone', 45, y, z);
        console.log(`Placed right wall at (45, ${y}, ${z})`);
      } catch (e) {
        console.log(`Right wall (45, ${y}, ${z}) err: ${e.message}`);
      }
    }
  }

  // Roof: (44, 67, z)
  const roof = bot.blockAt(new Vec3(44, 67, z));
  if (!roof || roof.name === 'air') {
    try {
      await lib.place('cobblestone', 44, 67, z);
      console.log(`Placed roof at (44, 67, ${z})`);
    } catch (e) {
      console.log(`Roof (44, 67, ${z}) err: ${e.message}`);
    }
  }
}

// Enclose slices z=-135, -136, -137
for (let z = -135; z >= -138; z--) {
  if (lib.count('cobblestone') < 5) break;
  // Step near z+1
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(44, 65, z + 1));
  } catch (e) {}
  await fortifySlice(z);
}

console.log('Cobblestone remaining:', lib.count('cobblestone'));
console.log('Pos at end:', lib.fmt(bot.entity.position));
