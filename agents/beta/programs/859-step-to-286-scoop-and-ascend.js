// programs/859-step-to-286-scoop-and-ascend.js
console.log('=== Program 859: Step to (286.5, 19, 7.5), Scoop & Ascend ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Step to (286.5, 19.0, 7.5)
const targetLedge = new Vec3(286.5, 19.0, 7.5);
console.log(`Walking 3 blocks to solid stone ledge at ${lib.fmt(targetLedge)}...`);
try {
  await lib.goTo(targetLedge.x, targetLedge.y, targetLedge.z, 0.5, { dig: false, timeoutMs: 6000 });
} catch (e) {
  console.log(`Ledge step note: ${e.message}`);
  // Fallback: manual step forward facing -X
  await bot.lookAt(targetLedge.offset(0, 0.5, 0), true);
  bot.setControlState('forward', true);
  await sleep(400);
  bot.setControlState('forward', false);
}

console.log(`Pos at ledge: ${lib.fmt(bot.entity.position)}`);

// STOP movement completely
bot.pathfinder.stop();
bot.clearControlStates();

// 2. Find lava source within 4.5m
const curPos = bot.entity.position;
const sources = bot.findBlocks({
  matching: b => b && b.name === 'lava' && b.metadata === 0,
  maxDistance: 4.5,
  count: 10
});

console.log(`Found ${sources.length} lava sources within 4.5m:`);
for (const s of sources) {
  console.log(`  Source at ${lib.fmt(s)} (dist: ${curPos.distanceTo(s).toFixed(2)}m)`);
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

// 3. Ascend to surface portal frame if lava secured!
if (lib.count('lava_bucket') > 0) {
  bot.chat('Beta: LAVA BUCKET SECURED! Ascending to portal frame (299, 72, -54)!');

  const moves = new Movements(bot, mcData);
  moves.canDig = true;
  moves.allowParkour = false;
  moves.liquidsCost = 50;
  bot.pathfinder.setMovements(moves);

  const ascentWps = [
    new Vec3(289, 19, 7),
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
