// programs/550-check-tunnel-surroundings.js
console.log('Alpha pos:', lib.fmt(bot.entity.position));
const nearby = bot.findBlocks({
  matching: b => b && (b.name === 'fire' || b.name === 'soul_fire' || b.name === 'lava'),
  maxDistance: 16,
  count: 10
});
console.log('Nearby fire/lava:', nearby.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));

// Check why pathfinder might fail:
// Test lib.walkTo vs lib.goTo
console.log('Alpha heading towards z=-12...');
await bot.lookAt(new Vec3(63.5, 65.0, -12.0), true);
bot.setControlState('forward', true);
await sleep(1500);
bot.setControlState('forward', false);
console.log('Alpha new pos after walk forward:', lib.fmt(bot.entity.position));
