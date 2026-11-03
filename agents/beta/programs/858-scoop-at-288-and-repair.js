// programs/858-scoop-at-288-and-repair.js
console.log('=== Program 858: Scoop Lava at (288, 19, 7) & Repair Portal ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
if (pick) await bot.equip(pick, 'hand');

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = false;
moves.liquidsCost = 50;
bot.pathfinder.setMovements(moves);

bot.chat('Beta: Navigating down to safe ledge (288, 19, 7) to scoop lava!');

// 1. Move from current position to shaft top (302, 71, -44)
console.log('Navigating to shaft entrance (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2.0, { dig: true, timeoutMs: 12000 });
} catch (e) {
  try { await bot.pathfinder.goto(new goals.GoalNear(302, 71, -44, 2.0)); } catch (e2) {}
}

console.log(`At shaft entrance: ${lib.fmt(bot.entity.position)}`);

// 2. Descend to (288, 19, 7) using 844's exact proven waypoints
const descentWps = [
  new Vec3(302, 57, -45),
  new Vec3(301, 45, -39),
  new Vec3(303, 36, -39),
  new Vec3(303, 18, -40),
  new Vec3(292, 19, 7),
  new Vec3(288, 19, 7)
];

for (let i = 0; i < descentWps.length; i++) {
  if (checkCancelled()) break;
  const wp = descentWps[i];
  console.log(`Descent WP ${i + 1}/${descentWps.length}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.8, { dig: true, timeoutMs: 14000 });
  } catch (e) {
    console.log(`WP ${i + 1} note: ${e.message}`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
    } catch (e2) {}
  }
  console.log(`Pos: ${lib.fmt(bot.entity.position)}`);
}

// 3. STOP! We are at (288, 19, 7). DO NOT WALK PAST x=286!
bot.pathfinder.stop();
bot.clearControlStates();

console.log(`Standing at safe ledge: ${lib.fmt(bot.entity.position)}`);

// Search for lava source within 4.5m
const sources = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 4.5,
  count: 10
});

console.log(`Found ${sources.length} lava sources within 4.5m of ${lib.fmt(bot.entity.position)}:`);
for (const s of sources) {
  console.log(`  Lava source at ${lib.fmt(s)} (dist: ${bot.entity.position.distanceTo(s).toFixed(2)}m)`);
}

if (sources.length > 0 && lib.count('lava_bucket') === 0) {
  const target = sources[0];
  console.log(`Scooping lava source at ${lib.fmt(target)}...`);
  const bkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (bkt) {
    await bot.equip(bkt, 'hand');
    await bot.lookAt(target.offset(0.5, 0.8, 0.5), true);
    await sleep(300);
    bot.activateItem();
    await sleep(1000);
  }
}

console.log(`Inventory: lava_bucket=${lib.count('lava_bucket')}`);

// 4. Ascend to portal if lava secured!
if (lib.count('lava_bucket') > 0) {
  bot.chat('Beta: LAVA BUCKET SECURED! Ascending to portal frame (299, 72, -54)!');

  const ascentWps = [
    new Vec3(292, 19, 7),
    new Vec3(303, 18, -40),
    new Vec3(303, 36, -39),
    new Vec3(301, 45, -39),
    new Vec3(302, 57, -45),
    new Vec3(302, 71, -44),
    new Vec3(297, 72, -54)
  ];

  for (let i = 0; i < ascentWps.length; i++) {
    if (checkCancelled()) break;
    const wp = ascentWps[i];
    console.log(`Ascent WP ${i + 1}/${ascentWps.length}: ${lib.fmt(wp)}...`);
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 1.8, { dig: true, timeoutMs: 14000 });
    } catch (e) {
      console.log(`Ascent WP ${i + 1} note: ${e.message}`);
      try {
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
      } catch (e2) {}
    }
  }

  console.log(`At surface portal area! Pos: ${lib.fmt(bot.entity.position)}`);

  const sillPos = new Vec3(299, 72, -54);
  const dist = bot.entity.position.distanceTo(sillPos);
  console.log(`Distance to portal sill: ${dist.toFixed(2)}m`);

  if (dist <= 3.5) {
    const curSill = bot.blockAt(sillPos);
    console.log(`Sill before place: ${curSill ? curSill.name : 'null'}`);
    if (curSill && curSill.name === 'air') {
      const lb = bot.inventory.items().find(i => i.name === 'lava_bucket');
      if (lb) {
        console.log('Placing lava into sill...');
        await bot.equip(lb, 'hand');
        await bot.lookAt(new Vec3(299.5, 72.1, -54.0), true);
        bot.activateItem();
        await sleep(1000);
        bot.chat('Beta: PLACED LAVA into sill at (299, 72, -54)! Quench with water now!');
      }
    }

    // Quench with water
    await sleep(1500);
    const sillAfter = bot.blockAt(sillPos);
    console.log(`Sill after place: ${sillAfter ? sillAfter.name : 'null'}`);
    if (sillAfter && (sillAfter.name === 'lava' || sillAfter.name === 'flowing_lava') && lib.count('water_bucket') > 0) {
      console.log('Quenching with Beta water_bucket...');
      const wb = bot.inventory.items().find(i => i.name === 'water_bucket');
      if (wb) {
        await bot.equip(wb, 'hand');
        await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
        bot.activateItem();
        await sleep(1500);

        // Scoop water back
        const eb = bot.inventory.items().find(i => i.name === 'bucket');
        if (eb) {
          await bot.equip(eb, 'hand');
          await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
          bot.activateItem();
          await sleep(800);
        }
      }
    }

    const finalSill = bot.blockAt(sillPos);
    console.log(`Final sill block at (299, 72, -54): ${finalSill ? finalSill.name : 'null'}`);
    if (finalSill && finalSill.name === 'obsidian') {
      bot.chat('Beta: OBSIDIAN SILL COMPLETE! Frame 100% restored! Delta ignite portal!');
    }
  }
}

return {
  pos: bot.entity.position,
  lava_bucket: lib.count('lava_bucket'),
  sill: bot.blockAt(new Vec3(299, 72, -54))?.name
};
