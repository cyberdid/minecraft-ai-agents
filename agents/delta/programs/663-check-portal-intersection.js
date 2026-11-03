console.log('=== INSPECT EXACT PORTAL INTERSECTION ===');
console.log(`Delta Pos: ${lib.fmt(bot.entity.position)}`);

const p1 = bot.blockAt(new Vec3(46, 66, 2));
const p2 = bot.blockAt(new Vec3(47, 66, 2));
const s1 = bot.blockAt(new Vec3(46, 65, 2));
const s2 = bot.blockAt(new Vec3(47, 65, 2));

console.log(`p1 (46, 66, 2): ${p1 ? p1.name : 'null'}`);
console.log(`p2 (47, 66, 2): ${p2 ? p2.name : 'null'}`);
console.log(`s1 (46, 65, 2): ${s1 ? s1.name : 'null'}`);
console.log(`s2 (47, 65, 2): ${s2 ? s2.name : 'null'}`);

const underFeet = bot.blockAt(bot.entity.position.offset(0, -0.5, 0));
console.log(`Under feet at ${lib.fmt(bot.entity.position.offset(0, -0.5, 0))}: ${underFeet ? underFeet.name : 'null'}`);
