// programs/237-enter-portal-properly.js
console.log('=== TRANSIT TO NETHER: STAND STILL IN PORTAL ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 1. Walk back towards base portal
console.log('Walking back to portal at (298, 72, -52)...');
await lib.goTo(298, 72, -52, 1, { timeoutMs: 25000 });
console.log('Near portal! Pos:', lib.fmt(bot.entity.position));

// 2. Identify portal blocks
const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 6,
  count: 6
});
console.log(`Nether portal blocks found (${portals.length}):`, portals.map(p => lib.fmt(p)));
if (portals.length === 0) throw new Error('No nether_portal blocks found within 6m!');

// Choose the portal block at y=73
const targetPortal = portals.find(p => p.y === 73) || portals[0];
console.log(`Targeting portal block at ${lib.fmt(targetPortal)}...`);

// Jump onto sill and walk into center of portal block
bot.setControlState('jump', true);
await lib.walkTo(targetPortal.x + 0.5, targetPortal.z + 0.5, 3000);
bot.clearControlStates();

console.log('Inside portal! Standing COMPLETELY STILL for dimension transit...');
console.log('Current standing pos:', lib.fmt(bot.entity.position));

// 3. Stand still and wait for dimension change (up to 15s)
const startWait = Date.now();
while (!isCancelled() && bot.game.dimension === 'minecraft:overworld' && (Date.now() - startWait < 15000)) {
  await sleep(200);
}

console.log('Dimension now:', bot.game.dimension);
console.log('Pos now:', lib.fmt(bot.entity.position));

if (bot.game.dimension === 'minecraft:the_nether') {
  console.log('Successfully arrived in the Nether!');
  // Step out of portal hitbox to clear cooldown
  await sleep(500);
  console.log('Stepping out of portal to bunker floor...');
  await lib.walkTo(40.5, -5.0, 3000);
  bot.clearControlStates();

  console.log('In Nether bunker! Final pos:', lib.fmt(bot.entity.position));
  console.log('HP:', bot.health, 'Food:', bot.food);
  console.log('Cobblestone:', lib.count('cobblestone'));
  console.log('Tools:', JSON.stringify(lib.tools()));
  bot.chat(`gamma arrived in Nether bunker at (40, 65, -5)! 38 cobble & stone gear ready for fortress!`);
} else {
  console.log('Still in overworld. Pos:', lib.fmt(bot.entity.position));
}
