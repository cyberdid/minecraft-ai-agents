// programs/787-solo-cast-portal-step1.js
console.log('=== Program 787: Fetch Lava & Return with Both Buckets ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'food:', bot.food, 'HP:', bot.health, 'inv:', lib.inv());

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain offhand shield
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

// 2. Step outside base door to surface
console.log('Stepping outside base door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.goTo(294, 72, -53, 1.0, { timeoutMs: 4000 });
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Outside base at:', lib.fmt(bot.entity.position));

// 3. Quick hunt if animal on grass
if (bot.food < 8) {
  const animals = Object.values(bot.entities).filter(e =>
    e.position && ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) &&
    e.position.distanceTo(bot.entity.position) < 24
  );
  if (animals.length > 0) {
    try {
      console.log(`Hunting ${animals[0].name} for quick sustenance...`);
      await lib.hunt(animals[0].name, 1);
      await sleep(300);
      await lib.eat();
    } catch (e) {}
  }
}

// 4. Fill Bucket 1 with water from base water pool at (292, 71, -50)
if (lib.count('water_bucket') === 0 && lib.count('bucket') > 0) {
  console.log('Filling Bucket 1 with water at (292, 71, -50)...');
  const wb = bot.findBlock({
    matching: b => b && b.name === 'water' && (b.getProperties()?.level === '0' || b.getProperties()?.level === 0 || b.metadata === 0),
    maxDistance: 16
  });
  if (wb) {
    await bot.pathfinder.goto(new goals.GoalNear(wb.position.x, wb.position.y + 1, wb.position.z, 2.0));
    const bkt = bot.inventory.items().find(i => i.name === 'bucket');
    if (bkt) await bot.equip(bkt, 'hand');
    await bot.lookAt(wb.position.offset(0.5, 0.8, 0.5), true);
    await sleep(200);
    bot.activateItem();
    await sleep(800);
  }
}

console.log('Water bucket count:', lib.count('water_bucket'), 'Empty bucket count:', lib.count('bucket'));
if (lib.count('water_bucket') === 0 || lib.count('bucket') === 0) {
  console.log('Note: Expected both water_bucket and empty bucket, continuing with current setup...');
}

bot.chat('alpha: Carrying water_bucket + empty bucket! Descending dry shaft to scoop lava at safe ledge (288, 19, 7)!');

// 5. Navigate to shaft mouth at (302, 71, -44)
console.log('Navigating to shaft mouth (302, 71, -44)...');
await bot.pathfinder.goto(new goals.GoalNear(302, 71, -44, 1.2));
console.log('At shaft mouth:', lib.fmt(bot.entity.position));

// 6. Safe staircase descent waypoints to (288, 19, 7)
const descentWps = [
  new Vec3(302, 66, -46),
  new Vec3(302, 60, -50),
  new Vec3(302, 53, -54),
  new Vec3(302, 45, -40),
  new Vec3(302, 35, -40),
  new Vec3(302, 25, -44),
  new Vec3(306, 19, -18),
  new Vec3(294, 19, 4),
  new Vec3(288.5, 19.0, 7.5) // Safe ledge!
];

console.log('Descending safe shaft staircase to y=19...');
for (let i = 0; i < descentWps.length && !checkCancelled(); i++) {
  const wp = descentWps[i];
  if (bot.entity.position.distanceTo(wp) < 2.5) continue;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
  } catch (e) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 8000 }); } catch (e2) {}
  }
}

console.log('Reached safe observation point near lava lake:', lib.fmt(bot.entity.position));

// 7. Find nearest lava source block within reach (2.5 to 4.5m)
const lakeLavas = bot.findBlocks({ matching: mcData.blocksByName.lava.id, maxDistance: 6, count: 20 });
console.log(`Lava blocks within reach (${lakeLavas.length}):`, lakeLavas.map(p => lib.fmt(p)));

const lavaSources = lakeLavas.filter(p => {
  const b = bot.blockAt(p);
  const props = b.getProperties();
  return props.level === '0' || props.level === 0 || (!props.level && b.metadata === 0);
});

console.log(`Lava sources within reach (${lavaSources.length}):`, lavaSources.map(p => lib.fmt(p)));

if (lavaSources.length > 0 && lib.count('bucket') > 0) {
  const targetLava = lavaSources[0];
  console.log(`Scooping lava source at ${lib.fmt(targetLava)}...`);
  const bkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (bkt) await bot.equip(bkt, 'hand');
  await bot.lookAt(targetLava.offset(0.5, 0.8, 0.5), true);
  await sleep(250);
  bot.activateItem();
  await sleep(1000);
}

const hasLava = lib.count('lava_bucket') > 0;
console.log(`*** Lava bucket status: ${hasLava ? 'SCOOPED!' : 'NOT SCOOPED'} ***`);

if (hasLava) {
  bot.chat('alpha: LAVA BUCKET SECURED! Ascending shaft to portal frame (299, 72, -54)!');
}

// 8. Ascend back up to surface (302, 71, -44)
console.log('Ascending shaft back to surface...');
const revWps = [...descentWps].reverse();
for (let i = 0; i < revWps.length && !checkCancelled(); i++) {
  const wp = revWps[i];
  if (bot.entity.position.distanceTo(wp) < 2.5) continue;
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
  } catch (e) {
    try { await lib.goTo(wp.x, wp.y, wp.z, 2.0, { timeoutMs: 8000 }); } catch (e2) {}
  }
}

console.log('Surface reached:', lib.fmt(bot.entity.position));

// 9. Move to portal frame at (299.5, 73.0, -52.0)
await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -52.0, 0.8));
console.log('At portal frame:', lib.fmt(bot.entity.position));

// 10. If Alpha holds lava_bucket and water_bucket, CAST IMMEDIATELY!
if (lib.count('lava_bucket') > 0) {
  console.log('Alpha holds lava_bucket! Placing into sill (299, 72, -54)...');
  const lb = bot.inventory.items().find(i => i.name === 'lava_bucket');
  if (lb) await bot.equip(lb, 'hand');
  await bot.lookAt(new Vec3(299.5, 71.9, -54.0), true);
  bot.activateItem();
  await sleep(1200);

  // Quench with water
  console.log('Quenching lava with water bucket...');
  const wb = bot.inventory.items().find(i => i.name === 'water_bucket');
  if (wb) {
    await bot.equip(wb, 'hand');
    await bot.lookAt(new Vec3(298.5, 73.5, -54.0), true);
    bot.activateItem();
    await sleep(1500);

    // Scoop water back up
    const bkt = bot.inventory.items().find(i => i.name === 'bucket');
    if (bkt) await bot.equip(bkt, 'hand');
    await bot.lookAt(new Vec3(298.5, 73.5, -54.0), true);
    bot.activateItem();
    await sleep(800);
  }

  // Strike with flint & steel
  const sillNow = bot.blockAt(new Vec3(299, 72, -54));
  console.log('Sill after quench is:', sillNow?.name);
  if (sillNow && sillNow.name === 'obsidian') {
    const fas = bot.inventory.items().find(i => i.name === 'flint_and_steel');
    if (fas) {
      await bot.equip(fas, 'hand');
      await bot.activateBlock(sillNow, new Vec3(0, 1, 0));
      await sleep(1200);
    }
  }

  // Verify portals
  const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
  if (portals.length > 0) {
    bot.chat(`alpha: NETHER PORTAL ACTIVE (${portals.length} blocks)! Milestone 7 RESTORED!`);
    await enterNetherPortal(20000);
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  lava: lib.count('lava_bucket'),
  water: lib.count('water_bucket'),
  portals: bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 }).length,
  inv: lib.inv()
};
