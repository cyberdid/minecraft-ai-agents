// programs/379-explore-fortress-and-farm-blazes.js
console.log('=== Program 379: Explore Fortress Interior & Farm Blazes ===');

console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Scan for key fortress blocks
const netherBricks = bot.findBlocks({
  matching: (b) => b && b.name.includes('nether_brick'),
  maxDistance: 32,
  count: 64
});
console.log(`Found ${netherBricks.length} nether_brick blocks nearby.`);

const spawners = bot.findBlocks({
  matching: (b) => b && b.name.includes('spawner'),
  maxDistance: 48,
  count: 5
});
console.log(`Spawners detected: ${spawners.length}`);
for (const sp of spawners) {
  console.log(`  Spawner at: ${lib.fmt(sp)}`);
}

const chests = bot.findBlocks({
  matching: (b) => b && b.name.includes('chest'),
  maxDistance: 32,
  count: 5
});
console.log(`Chests detected in fortress: ${chests.length}`);
for (const c of chests) {
  console.log(`  Chest at: ${lib.fmt(c)}`);
}

const warts = bot.findBlocks({
  matching: (b) => b && b.name === 'nether_wart',
  maxDistance: 32,
  count: 16
});
console.log(`Nether wart crops found: ${warts.length}`);

// 2. Scan for entities in the fortress
const blazes = Object.values(bot.entities).filter(e => 
  e && e.name === 'blaze' && e.position && bot.entity.position.distanceTo(e.position) < 32
);
console.log(`Blazes in combat range: ${blazes.length}`);

const withers = Object.values(bot.entities).filter(e => 
  e && e.name === 'wither_skeleton' && e.position && bot.entity.position.distanceTo(e.position) < 24
);
console.log(`Wither skeletons nearby: ${withers.length}`);

// 3. If a spawner is found, move towards it carefully
if (spawners.length > 0) {
  const sp = spawners[0];
  console.log(`Approaching Blaze Spawner at ${lib.fmt(sp)}...`);
  try {
    await lib.goTo(sp.x, sp.y + 1, sp.z, 3, { timeoutMs: 20000 });
  } catch (e) {
    console.log('Spawner approach note:', e.message);
  }
} else if (netherBricks.length > 0) {
  // Move onto the nearest nether brick corridor walkway
  const nb = netherBricks[0];
  console.log(`Moving onto fortress walkway at ${lib.fmt(nb)}...`);
  try {
    await lib.goTo(nb.x, nb.y + 1, nb.z, 1, { timeoutMs: 15000 });
  } catch (e) {
    console.log('Walkway step note:', e.message);
  }
}

// 4. Combat with Blazes
const activeBlazes = Object.values(bot.entities).filter(e => 
  e && e.name === 'blaze' && e.position && bot.entity.position.distanceTo(e.position) < 20
);

for (const bz of activeBlazes) {
  if (isCancelled()) break;
  if (bot.health <= 10) {
    console.log('Health low, taking cover!');
    break;
  }
  console.log(`Fighting Blaze at ${lib.fmt(bz.position)}...`);
  try {
    const sword = bot.inventory.items().find(i => i.name === 'iron_sword');
    if (sword) await bot.equip(sword, 'hand');
    await lib.equipArmor();

    await bot.lookAt(bz.position.offset(0, 0.9, 0), true);
    await bot.attack(bz);
    await sleep(600);
    if (bot.entities[bz.id]) {
      await bot.attack(bz);
      await sleep(600);
    }
    if (bot.entities[bz.id]) {
      await bot.attack(bz);
      await sleep(600);
    }
    await lib.pickup(6);
    console.log(`Blaze killed! Blaze rods in inv: ${lib.count('blaze_rod')}`);
  } catch (err) {
    console.log('Blaze fight note:', err.message);
  }
}

// 5. Harvest Nether Wart if nearby
if (warts.length > 0) {
  console.log('Harvesting nether_wart...');
  for (const wp of warts.slice(0, 8)) {
    try {
      await lib.dig(wp.x, wp.y, wp.z);
    } catch (e) {}
  }
  await lib.pickup(4);
  console.log(`Nether wart in inv: ${lib.count('nether_wart')}`);
}

bot.chat(`team: Alpha inside Nether Fortress at ${lib.fmt(bot.entity.position)}. Blaze rods: ${lib.count('blaze_rod')}, Spawners: ${spawners.length}. Wart: ${lib.count('nether_wart')}.`);

console.log('Alpha inventory:', JSON.stringify(lib.inv()));
console.log('Alpha status:', JSON.stringify(lib.status()));
