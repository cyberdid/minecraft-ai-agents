// programs/410-check-door.js
console.log('Pos:', lib.fmt(bot.entity.position));
const d1 = bot.blockAt(new Vec3(294, 72, -54));
console.log('Block at (294, 72, -54):', d1 ? d1.name : 'null');
const doors = bot.findBlocks({ matching: b => b && b.name.includes('door'), maxDistance: 10 });
console.log('Doors found nearby:', doors.map(p => `${lib.fmt(p)}: ${bot.blockAt(p)?.name}`).join(', '));
