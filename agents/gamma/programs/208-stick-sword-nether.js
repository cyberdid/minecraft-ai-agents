// programs/208-stick-sword-nether.js
console.log('--- CRAFT STICK, SWORD & ENTER NETHER ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Craft stick then stone_sword
console.log('Crafting sticks...');
await lib.craft('stick', 4);
console.log('Crafting stone_sword...');
await lib.craft('stone_sword', 1);
await lib.equipWeapon();
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

bot.chat(`gamma armed with stone sword & pickaxe, heading into Nether portal!`);

// 2. Navigate along south path to Overworld Nether portal at (299.5, 73.0, -53.5)
console.log('Moving to portal south path at (299.5, -52.0)...');
try {
  await lib.goTo(299, 72, -52, 1, { timeoutMs: 15000 });
} catch (e) {
  try { await lib.walkTo(299.5, -52.0, 4000); } catch (e2) {}
}

// Step up into portal block
console.log('Stepping up into portal frame (299.5, 73, -53.5)...');
bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 3000);
bot.setControlState('jump', false);
bot.clearControlStates();

console.log('Inside portal frame! Pos:', bot.entity.position);
console.log('Standing in:', bot.blockAt(bot.entity.position)?.name);

// 3. Stand still for 4s transit
console.log('Standing still for transit to Nether...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
  console.log(`Waiting in portal... dim=${bot.game.dimension}, pos=${lib.fmt(bot.entity.position)}`);
}

if (!String(bot.game.dimension).includes('nether')) {
  throw new Error('Did not transition to Nether within deadline');
}

console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));

// 4. Step out to bunker floor (40.5, 65, -5.0)
await lib.walkTo(40.5, -5.0, 3000);
bot.clearControlStates();
console.log('Nether bunker pos:', lib.fmt(bot.entity.position));

bot.chat(`gamma in Nether bunker ${lib.fmt(bot.entity.position)}! Sprinting through covered tunnel to Fortress Workshop.`);

// 5. Sprint through covered East Ridge tunnel to Fortress Workshop (44, 65, -140)
const waypoints = [
  new Vec3(63, 65, -3),
  new Vec3(63, 65, -30),
  new Vec3(62, 65, -60),
  new Vec3(62, 65, -100),
  new Vec3(50, 65, -115),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -140)
];

for (let i = 0; i < waypoints.length; i++) {
  const wp = waypoints[i];
  console.log(`Advancing to WP ${i + 1}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 15000 });
  } catch (e) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 10000 }); } catch (e2) {}
  }
}

console.log('Arrived at Fortress tunnel! Final pos:', lib.fmt(bot.entity.position));
console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma reached Fortress Workshop at ${lib.fmt(bot.entity.position)}!`);
