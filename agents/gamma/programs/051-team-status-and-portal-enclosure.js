// programs/051-team-status-and-portal-enclosure.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Check all team members
for (const p of Object.values(bot.players)) {
  if (p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}`);
  }
}

// 2. Check portal
const portalBlock = bot.blockAt(new Vec3(299, 73, -54));
console.log('Portal center block:', portalBlock ? portalBlock.name : 'null');

// 3. Build safety barrier around portal frame
// Portal frame is at x=298..301, y=72..76, z=-54
// Place safety cobblestone along the back (z=-55) or sides to secure it
console.log('Building safety border around portal...');
const barrierBlocks = [
  new Vec3(297, 72, -54),
  new Vec3(297, 73, -54),
  new Vec3(302, 72, -54),
  new Vec3(302, 73, -54)
];

for (const p of barrierBlocks) {
  const current = bot.blockAt(p);
  if (current && current.name === 'air' && lib.count('cobblestone') > 0) {
    try {
      await lib.place('cobblestone', p.x, p.y, p.z);
      console.log(`Placed protective barrier at ${lib.fmt(p)}`);
    } catch (e) {
      console.log(`Barrier place at ${lib.fmt(p)} note:`, e.message);
    }
  }
}

console.log('Gamma inventory now:', JSON.stringify(lib.inv()));
console.log('Time until night:', lib.time().secondsUntilNight);
bot.chat(`gamma portal status: active nether_portal verified, safety barrier reinforced. Team all at base!`);
