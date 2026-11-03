// programs/862-scoop-source-at-294.js
console.log('=== Program 862: Approach & Scoop Lava Source at (294, 17, 2) ===');
globalThis.isProgramCancelled = isCancelled;

const p = bot.entity.position;
console.log(`Current pos: ${lib.fmt(p)}`);

// Look at blocks around (294, 17, 2)
const target = new Vec3(294, 17, 2);
const tb = bot.blockAt(target);
const up = bot.blockAt(target.offset(0, 1, 0));
console.log(`Target (294, 17, 2): ${tb ? tb.name : 'null'}, meta=${tb ? tb.metadata : 'null'}, above=${up ? up.name : 'null'}`);

// Stand safely at (294, 18, 4)
const safeStand = new Vec3(294, 18, 4);
console.log(`Moving to safe stand at ${lib.fmt(safeStand)}...`);
try {
  await lib.goTo(safeStand.x, safeStand.y, safeStand.z, 0.8, { dig: true, timeoutMs: 8000 });
} catch (e) {
  console.log(`goTo note: ${e.message}`);
}

console.log(`Pos: ${lib.fmt(bot.entity.position)}, dist to target: ${bot.entity.position.distanceTo(target).toFixed(2)}m`);

// Scoop with bucket
const bkt = bot.inventory.items().find(i => i.name === 'bucket');
if (bkt && bot.entity.position.distanceTo(target) <= 4.0) {
  console.log('Equipping bucket and scooping...');
  await bot.equip(bkt, 'hand');
  await bot.lookAt(target.offset(0.5, 0.8, 0.5), true);
  await sleep(300);
  bot.activateItem();
  await sleep(1000);
}

console.log(`Inventory: lava_bucket=${lib.count('lava_bucket')}`);

// If lava secured, ascend to surface immediately!
if (lib.count('lava_bucket') > 0) {
  bot.chat('Beta: LAVA BUCKET SECURED! Ascending to portal frame at (299, 72, -54)!');

  const moves = new Movements(bot, mcData);
  moves.canDig = true;
  moves.allowParkour = false;
  moves.liquidsCost = 50;
  bot.pathfinder.setMovements(moves);

  const ascentWps = [
    new Vec3(296, 17, -8),
    new Vec3(300, 18, -24),
    new Vec3(303, 18, -40),
    new Vec3(303, 36, -39),
    new Vec3(301, 45, -39),
    new Vec3(302, 57, -45),
    new Vec3(302, 71, -44),
    new Vec3(297, 72, -54)
  ];

  for (let i = 0; i < ascentWps.length; i++) {
    if (isCancelled()) break;
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
