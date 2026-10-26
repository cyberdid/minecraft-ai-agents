// programs/190-tunnel-to-100.js
console.log('--- ADVANCE EAST RIDGE TUNNEL FROM Z=-60 TO Z=-100 ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Pickaxe durability:', JSON.stringify(lib.tools()));

bot.chat('gamma advancing covered East Ridge tunnel from z=-60 towards z=-100...');

const x = 62;
let currentZ = Math.floor(bot.entity.position.z);
console.log(`Starting at x=${x}, z=${currentZ}`);

for (let targetZ = currentZ - 1; targetZ >= -100 && !isCancelled(); targetZ--) {
  // 1. Dig head (y=66) and feet (y=65) if solid
  for (const y of [66, 65]) {
    const b = bot.blockAt(new Vec3(x, y, targetZ));
    if (b && b.boundingBox === 'block') {
      try {
        await lib.dig(x, y, targetZ);
        await sleep(35);
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
    } catch (e) {}
  }

  // 3. Step forward
  await lib.walkTo(x + 0.5, targetZ + 0.5, 2000);
  await lib.pickup(3);

  // Periodic report
  if (targetZ % 10 === 0) {
    console.log(`Tunnel advanced to (62, 65, ${targetZ})! Current pos: ${lib.fmt(bot.entity.position)}`);
    bot.chat(`gamma tunnel reached (62, 65, ${targetZ})!`);
  }
}

console.log('Final pos after tunneling:', lib.fmt(bot.entity.position));
console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma reached WP5 (62, 65, ${Math.floor(bot.entity.position.z)})! Turning West towards Fortress Workshop.`);
