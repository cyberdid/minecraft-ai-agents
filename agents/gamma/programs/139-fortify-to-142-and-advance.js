// programs/139-fortify-to-142-and-advance.js
console.log('--- FORTIFY BRIDGE TO Z=-142 AND SECURE ADVANCE ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Cobblestone:', lib.count('cobblestone'));

async function fortifySlice(z) {
  console.log(`Fortifying slice z=${z}...`);

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

// Fortify z=-139 through z=-142
for (let z = -139; z >= -142; z--) {
  if (lib.count('cobblestone') < 3) {
    console.log('Running low on cobblestone, stopping advance');
    break;
  }
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(44, 65, z + 1));
  } catch (e) {}
  await fortifySlice(z);
}

// Check floor ahead at z=-143
const f143 = bot.blockAt(new Vec3(44, 64, -143));
console.log(`Floor at (44, 64, -143): ${f143 ? f143.name : 'air'}`);

// Place a safety stop block at feet level (44, 65, -143) if it's air, so no one falls!
const stopBlock = bot.blockAt(new Vec3(44, 65, -143));
if (!stopBlock || stopBlock.name === 'air') {
  if (lib.count('cobblestone') >= 1) {
    try {
      await lib.place('cobblestone', 44, 65, -143);
      console.log('Placed safety stop barrier at (44, 65, -143)');
    } catch (e) {
      console.log('Safety barrier err:', e.message);
    }
  }
}

// Walk to (44, 65, -141)
try {
  await bot.pathfinder.goto(new goals.GoalBlock(44, 65, -141));
} catch (e) {}

console.log('Final position:', lib.fmt(bot.entity.position));
console.log('Cobblestone remaining:', lib.count('cobblestone'));

// Scan nearby entities and blazes
const blazes = Object.values(bot.entities).filter(e => e.name === 'blaze' && e.position);
console.log(`Blazes visible: ${blazes.length}:`, blazes.map(b => `${lib.fmt(b.position)} dist=${b.position.distanceTo(bot.entity.position).toFixed(1)}`).join(' | '));

bot.chat(`gamma fortified covered tunnel to (44, 65, -142) with safety barrier! Blaze Spawner at (32, 68, -190) is 48m ahead.`);
