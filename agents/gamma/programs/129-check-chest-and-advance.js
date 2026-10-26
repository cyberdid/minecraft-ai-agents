// programs/129-check-chest-and-advance.js
console.log('--- CHECK CHEST AND ADVANCE TO NETHER ---');
console.log('Start Pos:', lib.fmt(bot.entity.position));
console.log('Start Inv:', JSON.stringify(lib.inv()));

// 1. Walk to base doorway / chest
console.log('Walking to base at (294, 72, -56)...');
try {
  await lib.goTo(294, 72, -56, 1, { timeoutMs: 25000 });
} catch (e) {
  console.log('goTo failed, trying goToXZ:', e.message);
  await lib.goToXZ(294, -56, { timeoutMs: 20000 });
}

console.log('Now at:', lib.fmt(bot.entity.position));

// 2. Open chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);
console.log('Chest block at (293, 72, -57):', chestBlock ? chestBlock.name : 'null');

if (chestBlock && chestBlock.name.includes('chest')) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log('Chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));

    // Withdraw food, armor, tools, cobblestone, iron, gold
    for (const item of items) {
      const n = item.name;
      if (
        n.includes('cooked') || n.includes('beef') || n.includes('pork') || n.includes('bread') ||
        n.includes('apple') || n.includes('mutton') || n.includes('chicken') ||
        n.includes('iron') || n.includes('shield') || n.includes('golden') ||
        n.includes('cobblestone') || n.includes('torch')
      ) {
        try {
          await chest.withdraw(item.type, null, item.count);
          console.log(`Withdrew ${n} x ${item.count}`);
        } catch (err) {
          console.log(`Withdraw error for ${n}:`, err.message);
        }
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest open error:', e.message);
  }
} else {
  // Look for any nearby chest
  const nearbyChest = bot.findBlock({
    matching: b => b.name.includes('chest'),
    maxDistance: 10
  });
  if (nearbyChest) {
    console.log('Found chest at', lib.fmt(nearbyChest.position));
    try {
      const chest = await bot.openContainer(nearbyChest);
      const items = chest.containerItems();
      console.log('Chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));
      for (const item of items) {
        const n = item.name;
        if (n.includes('cooked') || n.includes('iron') || n.includes('cobblestone') || n.includes('golden') || n.includes('bread')) {
          await chest.withdraw(item.type, null, item.count);
        }
      }
      chest.close();
    } catch (e) {
      console.log('Nearby chest error:', e.message);
    }
  }
}

console.log('Inv after chest:', JSON.stringify(lib.inv()));
await lib.equipArmor();

// 3. Ensure we have a sword, pickaxe, and some cobblestone
if (lib.count('*_sword') === 0 && lib.count('cobblestone') >= 2) {
  try { await lib.craft('stone_sword', 1); } catch (e) {}
}
if (lib.count('*_pickaxe') === 0 && lib.count('cobblestone') >= 3) {
  try { await lib.craft('stone_pickaxe', 1); } catch (e) {}
}

const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

// 4. Move to Nether portal at (299, 73, -54)
console.log('Navigating to Nether portal at (299, 73, -54)...');
try {
  await lib.goTo(299, 73, -53, 1, { timeoutMs: 20000 });
} catch (e) {
  await lib.goToXZ(299, -53, { timeoutMs: 15000 });
}

// Step into portal and stand still
console.log('Stepping into purple portal frame (299, 73, -54)...');
await bot.pathfinder.goto(new goals.GoalBlock(299, 73, -54));
bot.clearControlStates();

console.log('Standing still for Nether transit...');
const t0 = Date.now();
while (!String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 25000) && !isCancelled()) {
  await sleep(1000);
}

if (!String(bot.game.dimension).includes('nether')) {
  console.log('Dimension currently:', bot.game.dimension);
  throw new Error('Did not transition to Nether within 25s');
}

console.log('SUCCESS! In the Nether at:', lib.fmt(bot.entity.position));
bot.chat('gamma in the Nether! Following Delta East Ridge waypoints to Fortress advance hallway (44, 65, -133).');

// 5. Follow Delta tested East Ridge waypoints
const deltaWaypoints = [
  new Vec3(63, 64, -5),
  new Vec3(62, 66, -30),
  new Vec3(61, 67, -59),
  new Vec3(54, 65, -90),
  new Vec3(44, 65, -127),
  new Vec3(44, 65, -133)
];

for (let i = 0; i < deltaWaypoints.length; i++) {
  const wp = deltaWaypoints[i];
  console.log(`Navigating to Waypoint ${i + 1}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { timeoutMs: 25000 });
    console.log(`Reached Waypoint ${i + 1} at ${lib.fmt(bot.entity.position)}`);
  } catch (e) {
    console.log(`WP ${i + 1} note: ${e.message}`);
  }
}

console.log('Final pos:', lib.fmt(bot.entity.position));
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Teammate ${name} at: ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}m`);
  }
}

bot.chat(`gamma joined team at Fortress advance hallway ${lib.fmt(bot.entity.position)}! Food=${lib.count('*beef') + lib.count('*pork*') + lib.count('bread')} HP=${bot.health}. Ready for Blaze Spawner (32, 68, -190).`);
