// programs/158-check-portal-coords.js
console.log('--- CHECK PORTAL EXACT COORDS ---');
console.log('Bot pos exact:', bot.entity.position);
const standingIn = bot.blockAt(bot.entity.position);
console.log('Standing in:', standingIn ? `${standingIn.name} at ${standingIn.position}` : 'null');

const p1 = bot.blockAt(new Vec3(40, 65, -7));
const p2 = bot.blockAt(new Vec3(41, 65, -7));
console.log('Block at (40, 65, -7):', p1 ? p1.name : 'null');
console.log('Block at (41, 65, -7):', p2 ? p2.name : 'null');

// Find all nether_portal blocks within 5 blocks
const portals = bot.findBlocks({ matching: b => b.name === 'nether_portal', maxDistance: 5, count: 10 });
for (const p of portals) {
  console.log(`Portal block at exact ${p.x}, ${p.y}, ${p.z}`);
}
