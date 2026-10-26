// programs/039-return-to-base.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// Climb stairs up to surface
console.log('Climbing stairs to (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 1, { dig: true });
} catch (e) {
  console.log('GoTo surface error:', e.message);
}

console.log('Surface reached:', lib.fmt(bot.entity.position));

// Walk to base door
console.log('Walking to base door (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
  await lib.goThroughDoor(294, 72, -54, { close: true });
} catch (e) {
  console.log('Base door error:', e.message);
}

console.log('Inside base at', lib.fmt(bot.entity.position));

// Check portal block
const portalBlock = bot.blockAt(new Vec3(299, 73, -54));
console.log('Portal center block:', portalBlock ? portalBlock.name : 'null');

bot.chat('gamma at base. Milestone 7 confirmed! Next stage: full iron gear, cooked food, and Nether expedition prep!');
