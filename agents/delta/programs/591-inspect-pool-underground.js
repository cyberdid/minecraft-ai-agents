for (let y = 60; y <= 65; y++) {
  const b = bot.blockAt(new Vec3(333, y, -78));
  console.log(`(333, ${y}, -78): ${b ? b.name : 'null'}`);
}
// Also search in a 32 block sphere for lava
const anyLava = bot.findBlocks({ matching: b => b && b.name === 'lava', maxDistance: 48, count: 10 });
console.log('Any lava within 48 blocks:', anyLava.map(p => lib.fmt(p)));
