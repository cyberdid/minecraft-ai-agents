// programs/335-step-up-and-check-portal.js
console.log('=== Step up ledge towards shaft and inspect portal progress ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Jump up onto (299, 17, -32)
await bot.lookAt(new Vec3(299, 18, -33), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1000);
bot.clearControlStates();

console.log('After jump pos:', lib.fmt(bot.entity.position));

// 2. Walk along corridor towards z=-44
const m = new Movements(bot, mcData);
m.canDig = false;
m.allowParkour = true;
m.allow1by1towers = false;
bot.pathfinder.setMovements(m);

try {
  console.log('Navigating towards (302, 25, -40)...');
  await lib.goTo(302, 25, -40, 2, { timeoutMs: 15000 });
  console.log('Reached (302, 25, -40):', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Corridor nav note:', e.message);
}

// 3. Ascend stairs towards (302, 71, -44)
try {
  console.log('Ascending stairs towards surface...');
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 30000 });
  console.log('Reached surface!', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Stairs note:', e.message);
}

// 4. Check portal state at (298, 72, -54)
const p1 = bot.blockAt(new Vec3(299, 73, -54));
const p2 = bot.blockAt(new Vec3(300, 73, -54));
console.log(`Portal inspection: p1=${p1 ? p1.name : 'null'}, p2=${p2 ? p2.name : 'null'}`);

// Report teammate positions
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (e && e.type === 'player' && e.username !== bot.username) {
    console.log(`Player ${e.username} at ${lib.fmt(e.position)}`);
  }
}
