// programs/188-tunnel-north-along-ridge.js
console.log('--- TUNNEL NORTH THROUGH SOUL RIDGE TOWARDS FORTRESS ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Teammates here:');
for (const p of Object.values(bot.players)) {
  if (p.username !== bot.username && p.entity) {
    console.log(`  ${p.username} at ${lib.fmt(p.entity.position)}`);
  }
}

bot.chat('gamma digging covered ridge tunnel North along x=63 towards Fortress Workshop...');

const x = 63;
let currentZ = Math.floor(bot.entity.position.z);
console.log(`Current z: ${currentZ}`);

// Dig forward from currentZ down to -30
for (let targetZ = currentZ - 1; targetZ >= -30 && !isCancelled(); targetZ--) {
  console.log(`Advancing tunnel to z=${targetZ}...`);
  
  // 1. Dig head (y=66) and feet (y=65)
  for (const y of [66, 65]) {
    const b = bot.blockAt(new Vec3(x, y, targetZ));
    if (b && b.boundingBox === 'block') {
      try {
        await lib.dig(x, y, targetZ);
        await sleep(50);
      } catch (e) {
        console.log(`Dig error at (${x}, ${y}, ${targetZ}):`, e.message);
      }
    }
  }

  // 2. Ensure solid floor underfoot at y=64
  const floor = bot.blockAt(new Vec3(x, 64, targetZ));
  if (!floor || floor.boundingBox !== 'block') {
    console.log(`Placing floor at (${x}, 64, ${targetZ})...`);
    const filler = lib.count('netherrack') > 0 ? 'netherrack' : (lib.count('soul_sand') > 0 ? 'soul_sand' : 'cobblestone');
    try {
      await lib.place(filler, x, 64, targetZ);
    } catch (e) {
      console.log('Floor place note:', e.message);
    }
  }

  // 3. Step forward into the newly cleared tunnel block
  await lib.walkTo(x + 0.5, targetZ + 0.5, 2000);
  await lib.pickup(3);

  // Periodic report
  if (targetZ % 5 === 0) {
    console.log(`Tunnel advanced to z=${targetZ}! Pos: ${lib.fmt(bot.entity.position)}`);
    bot.chat(`gamma tunnel advanced to (63, 65, ${targetZ})!`);
  }
}

console.log('Final pos after tunneling:', lib.fmt(bot.entity.position));
console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma safely reached (63, 65, ${Math.floor(bot.entity.position.z)}) in covered ridge tunnel!`);
