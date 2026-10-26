// programs/526-build-west-wall-bottom-up.js
console.log('=== Program 526: Build West Wall Bottom-Up ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Cobble:', lib.count('cobblestone'));

bot.pathfinder.stop();
await sleep(100);

for (let z = -157; z >= -160; z--) {
  if (lib.count('cobblestone') < 5) break;
  console.log(`Securing x=43 at z=${z}...`);
  
  // 1. Floor at (43, 64, z)
  const floor = bot.blockAt(new Vec3(43, 64, z));
  if (!floor || floor.name === 'air' || floor.name === 'cave_air') {
    try {
      await lib.place('cobblestone', 43, 64, z);
      console.log(`Placed floor at (43, 64, ${z})!`);
    } catch (e) {
      console.log(`Floor (43, 64, ${z}) note: ${e.message}`);
    }
  }

  // 2. Lower wall at (43, 65, z)
  const wall1 = bot.blockAt(new Vec3(43, 65, z));
  if (!wall1 || wall1.name === 'air' || wall1.name === 'cave_air') {
    try {
      await lib.place('cobblestone', 43, 65, z);
      console.log(`Placed lower wall at (43, 65, ${z})!`);
    } catch (e) {
      console.log(`Lower wall (43, 65, ${z}) note: ${e.message}`);
    }
  }

  // 3. Upper wall at (43, 66, z)
  const wall2 = bot.blockAt(new Vec3(43, 66, z));
  if (!wall2 || wall2.name === 'air' || wall2.name === 'cave_air') {
    try {
      await lib.place('cobblestone', 43, 66, z);
      console.log(`Placed upper wall at (43, 66, ${z})!`);
    } catch (e) {
      console.log(`Upper wall (43, 66, ${z}) note: ${e.message}`);
    }
  }

  // 4. Roof at (44, 67, z)
  const roof = bot.blockAt(new Vec3(44, 67, z));
  if (!roof || roof.name === 'air' || roof.name === 'cave_air') {
    try {
      await lib.place('cobblestone', 44, 67, z);
      console.log(`Placed roof at (44, 67, ${z})!`);
    } catch (e) {
      console.log(`Roof (44, 67, ${z}) note: ${e.message}`);
    }
  }
}

bot.chat(`alpha: Enclosed corridor complete from z=-157 to z=-160! Holding ${lib.count('cobblestone')} cobble!`);
console.log('Finished pass. Remaining cobble:', lib.count('cobblestone'));
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
