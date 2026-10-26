// programs/189-tunnel-to-60.js
console.log('--- ADVANCE COVERED RIDGE TUNNEL FROM Z=-30 TO Z=-60 ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat('gamma continuing covered East Ridge tunnel from z=-30 towards z=-60...');

const x = 62; // Stay on x=62
let currentZ = Math.floor(bot.entity.position.z);
console.log(`Starting at x=${x}, z=${currentZ}`);

for (let targetZ = currentZ - 1; targetZ >= -60 && !isCancelled(); targetZ--) {
  // 1. Dig head (y=66) and feet (y=65)
  for (const y of [66, 65]) {
    const b = bot.blockAt(new Vec3(x, y, targetZ));
    if (b && b.boundingBox === 'block') {
      try {
        await lib.dig(x, y, targetZ);
        await sleep(40);
      } catch (e) {
        console.log(`Dig error at (${x}, ${y}, ${targetZ}):`, e.message);
      }
    }
  }

  // 2. Ensure solid floor underfoot at y=64
  const floor = bot.blockAt(new Vec3(x, 64, targetZ));
  if (!floor || floor.boundingBox !== 'block') {
    const filler = lib.count('netherrack') > 0 ? 'netherrack' : (lib.count('soul_soil') > 0 ? 'soul_soil' : 'soul_sand');
    try {
      await lib.place(filler, x, 64, targetZ);
    } catch (e) {
      console.log(`Floor place note at (${x}, 64, ${targetZ}):`, e.message);
    }
  }

  // 3. Step forward into cleared block
  await lib.walkTo(x + 0.5, targetZ + 0.5, 2000);
  await lib.pickup(3);

  // Periodic report
  if (targetZ % 5 === 0) {
    console.log(`Tunnel advanced to (62, 65, ${targetZ})! Current pos: ${lib.fmt(bot.entity.position)}`);
    bot.chat(`gamma tunnel reached (62, 65, ${targetZ})!`);
  }
}

console.log('Final pos after tunneling:', lib.fmt(bot.entity.position));
console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma covered tunnel complete to (62, 65, ${Math.floor(bot.entity.position.z)})!`);
