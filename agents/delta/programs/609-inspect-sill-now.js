const b = bot.blockAt(new Vec3(299, 72, -54));
console.log('Block at (299, 72, -54):', b ? b.name : 'null');
const bUp = bot.blockAt(new Vec3(299, 73, -54));
console.log('Block at (299, 73, -54):', bUp ? bUp.name : 'null');
const portal = bot.findBlock({ matching: bl => bl && bl.name === 'nether_portal', maxDistance: 8 });
console.log('Portal active:', portal ? 'YES' : 'NO');
