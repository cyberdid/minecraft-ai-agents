// programs/857-safest-lava-and-portal.js
console.log('=== Program 857: Safest Lava Scoop & Portal Repair ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Step out of base
console.log('Exiting base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(294, 72, -52, 1.2, { timeoutMs: 4000 }); } catch (e2) {}
}

const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = false;
moves.liquidsCost = 100;
bot.pathfinder.setMovements(moves);

bot.chat('Beta: Descending safe staircase to (284, 19, 7) to scoop lava without stepping forward!');

const descentWps = [
  new Vec3(302, 71, -44),
  new Vec3(302, 57, -45),
  new Vec3(301, 45, -39),
  new Vec3(303, 30, -39),
  new Vec3(303, 18, -40),
  new Vec3(300, 18, -24),
  new Vec3(296, 17, -8),
  new Vec3(289, 19, 7),
  new Vec3(284, 19, 7)
];

for (let i = 0; i < descentWps.length; i++) {
  if (checkCancelled()) break;
  const wp = descentWps[i];
  console.log(`Descent WP ${i + 1}/${descentWps.length}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.2, { dig: false, timeoutMs: 14000 });
  } catch (e) {
    console.log(`Descent WP ${i + 1} note: ${e.message}`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
    } catch (e2) {}
  }
}

console.log(`Arrived at safe ledge: ${lib.fmt(bot.entity.position)}`);

// STOP MOVEMENT completely!
bot.pathfinder.stop();
bot.clearControlStates();

// Scan for the nearest true lava source within reach (<= 4.5m)
const curPos = bot.entity.position;
const sources = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 5.0,
  count: 10
});

console.log(`Found ${sources.length} lava sources within 5m of ${lib.fmt(curPos)}:`);
for (const s of sources) {
  console.log(`  Source at ${lib.fmt(s)} (dist: ${curPos.distanceTo(s).toFixed(2)}m)`);
}

if (sources.length > 0 && lib.count('lava_bucket') === 0) {
  const target = sources[0];
  console.log(`Scooping source at ${lib.fmt(target)} from standing pos without moving...`);
  const bkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (bkt) {
    await bot.equip(bkt, 'hand');
    // Look at target source block
    await bot.lookAt(target.offset(0.5, 0.8, 0.5), true);
    await sleep(300);
    bot.activateItem();
    await sleep(1000);
  }
}

console.log(`Lava bucket in inventory: ${lib.count('lava_bucket')}`);

// If lava scooped, ascend back to base portal!
if (lib.count('lava_bucket') > 0) {
  bot.chat('Beta: LAVA BUCKET SECURED! Ascending to portal frame at (299, 72, -54)!');

  const ascentWps = [
    new Vec3(289, 19, 7),
    new Vec3(296, 17, -8),
    new Vec3(300, 18, -24),
    new Vec3(303, 18, -40),
    new Vec3(303, 30, -39),
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
      await lib.goTo(wp.x, wp.y, wp.z, 1.5, { dig: false, timeoutMs: 14000 });
    } catch (e) {
      console.log(`Ascent WP ${i + 1} note: ${e.message}`);
      try {
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
      } catch (e2) {}
    }
  }

  console.log(`Arrived at surface: ${lib.fmt(bot.entity.position)}`);

  const sillPos = new Vec3(299, 72, -54);
  const dist = bot.entity.position.distanceTo(sillPos);
  console.log(`Distance to sill: ${dist.toFixed(2)}m`);

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
