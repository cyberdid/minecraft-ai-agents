// programs/243-quench-and-mine-10-obsidian.js
console.log('=== Program 243: Safe Quench & Mine 10 Obsidian for Nether Portal ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Night in:', lib.time().secondsUntilNight);

bot.chat('beta: Heading down shaft to quench lava lake at (288, 19, 8) and mine 10 obsidian for the portal!');

// 1. Quick hunt if animal nearby
const animal = bot.nearestEntity(e => (e.name === 'pig' || e.name === 'cow' || e.name === 'sheep') && e.position.distanceTo(bot.entity.position) < 16);
if (animal) {
  try {
    const sword = mcData.itemsByName.stone_sword?.id;
    if (sword) await bot.equip(sword, 'hand');
    await bot.pathfinder.goto(new goals.GoalNear(animal.position.x, animal.position.y, animal.position.z, 2));
    for (let i = 0; i < 3; i++) {
      bot.attack(animal);
      await sleep(500);
      if (!animal.isValid) break;
    }
    await lib.pickup(4);
    for (const f of ['porkchop', 'cooked_porkchop', 'beef', 'cooked_beef', 'mutton']) {
      if (lib.count(f) > 0) {
        const item = bot.inventory.items().find(it => it.name === f);
        if (item) {
          await bot.equip(item, 'hand');
          bot.activateItem();
          await sleep(2000);
          bot.deactivateItem();
        }
      }
    }
  } catch (e) {}
}

// 2. Navigate down the shaft towards (288, 19, 8)
const stages = [
  { x: 302, y: 71, z: -44 },
  { x: 328, y: 45, z: -70 },
  { x: 328, y: 20, z: -70 },
  { x: 295, y: 19, z: -10 },
  { x: 288, y: 19, z: 8 }
];

for (let i = 0; i < stages.length; i++) {
  if (isCancelled()) break;
  const target = stages[i];
  console.log(`Heading to stage ${i+1}/${stages.length}: (${target.x}, ${target.y}, ${target.z})...`);
  try {
    await lib.goTo(target.x, target.y, target.z, 2, { dig: true, timeoutMs: 25000 });
  } catch (err) {
    console.log(`Stage ${i+1} note:`, err.message);
  }
}

console.log('At lava lake ledge! Pos:', lib.fmt(bot.entity.position));

// 3. Scan lava blocks
const lavas = bot.findBlocks({ matching: b => b.name === 'lava', maxDistance: 24, count: 50 });
console.log(`Found ${lavas.length} lava blocks near ledge.`);

// 4. Safe obsidian quenching and mining function
const doSafeObsidian = async (n = 10) => {
  const isAir = (b) => b && (b.name === 'air' || b.name === 'cave_air');
  const diaPickId = mcData.itemsByName.diamond_pickaxe.id;
  const waterBucketId = mcData.itemsByName.water_bucket.id;
  const bucketId = mcData.itemsByName.bucket.id;

  for (let round = 0; round < 6 && lib.count('obsidian') < n; round++) {
    if (isCancelled()) break;
    // Find lava sources with cave_air/air above
    const pools = bot.findBlocks({ matching: bl => bl && bl.name === 'lava' && bl.metadata === 0, maxDistance: 32, count: 64 })
      .map(p => bot.blockAt(p)).filter(Boolean)
      .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

    let edge = null;
    for (const lava of pools) {
      const up = bot.blockAt(lava.position.offset(0, 1, 0));
      if (!isAir(up)) continue;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nb = bot.blockAt(lava.position.offset(dx, 0, dz));
        const nbUp = bot.blockAt(lava.position.offset(dx, 1, dz));
        if (nb && nb.boundingBox === 'block' && isAir(nbUp)) { edge = nb; break; }
      }
      if (edge) break;
    }

    if (!edge) {
      console.log('No edge found, placing cobblestone curb next to first open lava source...');
      if (pools.length > 0) {
        const p = pools[0].position.offset(1, 0, 0);
        await lib.place('cobblestone', p.x, p.y, p.z).catch(() => {});
        edge = bot.blockAt(p);
      }
    }

    if (!edge) {
      console.log('Could not find or make edge for lava pool.');
      break;
    }

    const e = edge.position;
    console.log(`Pouring water onto solid edge at ${lib.fmt(e)}...`);
    await bot.pathfinder.goto(new goals.GoalNear(e.x, e.y + 1, e.z, 3)).catch(() => {});
    await bot.equip(waterBucketId, 'hand');
    await bot.lookAt(e.offset(0.5, 1, 0.5), true);
    bot.activateItem();
    await sleep(3500); // let water spread

    // Scoop water back
    const water = bot.blockAt(e.offset(0, 1, 0));
    if (water && water.name === 'water') {
      console.log('Scooping water back into bucket...');
      await bot.equip(bucketId, 'hand');
      await bot.lookAt(e.offset(0.5, 1.5, 0.5), true);
      bot.activateItem();
      await sleep(800);
    }

    // Mine formed obsidian
    const obs = bot.findBlocks({ matching: bl => bl && bl.name === 'obsidian', maxDistance: 16, count: 20 });
    console.log(`Obsidian blocks formed: ${obs.length}! Mining...`);
    await bot.equip(diaPickId, 'hand');
    for (const op of obs) {
      if (isCancelled() || lib.count('obsidian') >= n) break;
      try {
        await lib.goTo(op.x, op.y + 1, op.z, 2, { timeoutMs: 12000 });
        await bot.equip(diaPickId, 'hand');
        console.log(`Digging obsidian at ${lib.fmt(op)}...`);
        await lib.dig(op.x, op.y, op.z);
        await sleep(200);
        await lib.pickup(4);
        console.log(`Obsidian count now: ${lib.count('obsidian')}`);
      } catch (err) {
        console.log('Dig obsidian note:', err.message);
      }
    }
  }
};

if (lib.count('diamond_pickaxe') > 0 && lib.count('water_bucket') > 0) {
  console.log('Starting obsidian quenching & mining...');
  try {
    await doSafeObsidian(10);
  } catch (err) {
    console.log('doSafeObsidian note:', err.message);
  }
}

console.log(`Total obsidian gathered: ${lib.count('obsidian')}`);

// 5. If we have obsidian, ascend back to base portal site at (298, 72, -54)
if (lib.count('obsidian') > 0) {
  console.log('Ascending back to base portal site...');
  const upStages = [
    { x: 295, y: 19, z: -10 },
    { x: 328, y: 20, z: -70 },
    { x: 328, y: 45, z: -70 },
    { x: 302, y: 71, z: -44 },
    { x: 298, y: 72, z: -54 }
  ];
  for (const st of upStages) {
    if (isCancelled()) break;
    try { await lib.goTo(st.x, st.y, st.z, 2, { timeoutMs: 20000 }); } catch (e) {}
  }

  // 6. Assemble portal frame at (298, 72, -54)
  console.log('Building Nether portal frame at (298, 72, -54)...');
  const frame = lib.shapes.portal(298, 72, -54, 'x');
  try {
    const buildRes = await lib.build(frame);
    console.log('Portal build report:', JSON.stringify(buildRes));
  } catch (e) {
    console.log('Portal build note:', e.message);
  }

  // Check if frame is complete
  const checkMat = lib.materials(frame);
  console.log('Portal frame remaining needs:', JSON.stringify(checkMat));
}

bot.chat(`beta: Alpha status: Obsidian in inv=${lib.count('obsidian')}/10. Pos: ${lib.fmt(bot.entity.position)}.`);
console.log('Finished 243. Status:', JSON.stringify(lib.status()));
