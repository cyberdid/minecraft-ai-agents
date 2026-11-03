// programs/382-rendezvous-with-delta-and-share-swords.js
console.log('=== RENDEZVOUS WITH DELTA AT FORTRESS BUNKER ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Walk south along continuous covered tunnel to Fortress Workshop Bunker
const tunnelWaypoints = [
  new Vec3(44.0, 65.0, -160.0),
  new Vec3(44.0, 65.0, -145.0),
  new Vec3(44.0, 65.0, -135.0),
  new Vec3(44.0, 65.0, -128.0)
];

for (let i = 0; i < tunnelWaypoints.length && !isCancelled(); i++) {
  const wp = tunnelWaypoints[i];
  console.log(`Advancing down covered tunnel to ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.5, { timeoutMs: 10000 });
  } catch (e) {
    try { await lib.goToXZ(wp.x, wp.z, { timeoutMs: 8000 }); } catch (e2) {}
  }
}

console.log('Arrived at Fortress Bunker! Pos:', lib.fmt(bot.entity.position));
bot.chat('gamma: rendezvoused with Delta at Fortress Bunker! Sharing stone sword & cobble!');

// 2. Scan for Delta
const delta = Object.values(bot.entities).find(e => e && e.name === 'player' && e.username === 'delta') ||
              bot.players.delta?.entity;

if (delta) {
  console.log(`Delta found at ${lib.fmt(delta.position)} (dist: ${bot.entity.position.distanceTo(delta.position).toFixed(1)}m)!`);
  try {
    await bot.lookAt(delta.position.offset(0, delta.height * 0.8, 0));

    // Toss 1 stone sword to Delta
    if (lib.count('stone_sword') >= 2) {
      console.log('Tossing 1 stone_sword to Delta...');
      await bot.toss(mcData.itemsByName.stone_sword.id, null, 1);
      await sleep(1000);
    }

    // Toss 10 cobblestone to Delta
    if (lib.count('cobblestone') >= 15) {
      console.log('Tossing 10 cobblestone to Delta...');
      await bot.toss(mcData.itemsByName.cobblestone.id, null, 10);
      await sleep(1000);
    }
  } catch (err) {
    console.log('Toss note:', err.message);
  }
} else {
  console.log('Delta entity not currently within loaded sight, checking chest/bunker...');
}

// 3. Check for any chest or drops in bunker
const chests = bot.findBlocks({
  matching: b => b && b.name.includes('chest'),
  maxDistance: 8,
  count: 3
});
if (chests.length > 0) {
  const cp = chests[0];
  try {
    const contents = await lib.chestContents(cp.x, cp.y, cp.z);
    console.log('Bunker chest contents:', JSON.stringify(contents));
    // Withdraw food if available
    for (const food of ['cooked_porkchop', 'cooked_beef', 'bread', 'cooked_mutton']) {
      if (contents && contents[food] > 0) {
        await lib.withdraw({ [food]: 'all' }, cp.x, cp.y, cp.z);
        await lib.eat();
      }
    }
  } catch (e) {}
}

console.log('Ending inventory:', JSON.stringify(lib.inv()));
console.log('Status:', JSON.stringify(lib.status()));
