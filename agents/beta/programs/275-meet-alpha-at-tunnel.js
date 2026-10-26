// programs/275-meet-alpha-at-tunnel.js
console.log('=== Step 33: Walk down to meet Alpha at (333, 49, -46) ===');

// 1. Exit base
console.log('Exiting base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}

// 2. Walk to shaft entrance (302, 71, -44)
console.log('Walking to shaft entrance (302, 71, -44)...');
await lib.goTo(302, 71, -44, 1, { timeoutMs: 15000 });

// 3. Navigate down towards Alpha at (333, 49, -46)
console.log('Navigating down shaft towards Alpha...');
try {
  await lib.goTo(333, 49, -46, 3, { timeoutMs: 25000, dig: true });
  console.log('Reached Alpha area! Beta at:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Path to Alpha note:', e.message);
}

// 4. Inspect Alpha
const alpha = bot.players['alpha']?.entity;
if (alpha) {
  console.log('Alpha is at:', lib.fmt(alpha.position), 'distance:', alpha.position.distanceTo(bot.entity.position).toFixed(1));
  if (alpha.heldItem) {
    console.log('Alpha held item:', alpha.heldItem.name);
  }
  const eq = alpha.equipment;
  if (eq) {
    console.log('Alpha equipment:', eq.map(it => it ? it.name : 'empty'));
  }
} else {
  console.log('Alpha not visible nearby.');
}

// 5. Scan for obsidian and lava in the area
const nearbyObsidian = bot.findBlocks({
  matching: b => b && b.name === 'obsidian',
  maxDistance: 16,
  count: 20
});
console.log(`Found ${nearbyObsidian.length} obsidian blocks in tunnel:`, nearbyObsidian.map(p => lib.fmt(p)));

const nearbyLava = bot.findBlocks({
  matching: b => b && b.name === 'lava',
  maxDistance: 16,
  count: 20
});
console.log(`Found ${nearbyLava.length} lava blocks in tunnel:`, nearbyLava.map(p => lib.fmt(p)));

// 6. Return to base before dusk
console.log('Returning to base at (294, 72, -54)...');
try {
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 30000, dig: true });
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base safely!');
} catch (e) {
  console.log('Return note:', e.message);
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Met up with Alpha. Obsidian found: ${nearbyObsidian.length}, lava found: ${nearbyLava.length}.`);
