// programs/846-fill-lava-and-cast-portal.js
console.log('=== Program 846: Fill Lava Bucket & Cast Portal Sill ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Defend against any close hostiles
const hostiles = lib.hostiles(8);
if (hostiles.length > 0) {
  console.log(`Defending against ${hostiles.length} hostiles...`);
  await lib.equipWeapon();
  for (const h of hostiles) {
    const ent = Object.values(bot.entities).find(e => e.id === h.id);
    if (ent && ent.isValid) {
      await bot.lookAt(ent.position.offset(0, 1, 0), true);
      bot.attack(ent);
      await sleep(600);
      if (ent.isValid) bot.attack(ent);
    }
  }
}

// 1. Fill bucket with lava using lib.fillBucket('lava')
if (lib.count('lava_bucket') === 0 && lib.count('bucket') > 0) {
  console.log('Calling lib.fillBucket("lava")...');
  try {
    const fillRes = await lib.fillBucket('lava');
    console.log('fillBucket result:', fillRes);
  } catch (err) {
    console.log('lib.fillBucket error:', err.message);
    // Manual fallback: find lava source within 10m
    const sources = bot.findBlocks({
      matching: b => b && b.name === 'lava' && b.metadata === 0,
      maxDistance: 12,
      count: 5
    });
    if (sources.length > 0) {
      const s = sources[0];
      console.log(`Manual scoop fallback at ${lib.fmt(s)}...`);
      await lib.goTo(s.x, s.y + 1, s.z, 2.5, { dig: false, timeoutMs: 8000 });
      const bkt = bot.inventory.items().find(i => i.name === 'bucket');
      if (bkt) {
        await bot.equip(bkt, 'hand');
        await bot.lookAt(s.offset(0.5, 0.5, 0.5), true);
        bot.activateItem();
        await sleep(1000);
      }
    }
  }
}

console.log(`Lava bucket count in inventory: ${lib.count('lava_bucket')}`);

if (lib.count('lava_bucket') > 0) {
  bot.chat('Beta: LAVA BUCKET FILLED! Ascending to portal frame at (299, 72, -54)!');

  const ascentWps = [
    new Vec3(303, 18, -40),
    new Vec3(303, 36, -39),
    new Vec3(301, 45, -39),
    new Vec3(302, 60, -41),
    new Vec3(302, 71, -44),
    new Vec3(297, 72, -54)
  ];

  for (let i = 0; i < ascentWps.length; i++) {
    if (checkCancelled()) break;
    const wp = ascentWps[i];
    console.log(`Ascending to WP ${i + 1}/${ascentWps.length}: ${lib.fmt(wp)}...`);
    try {
      await lib.goTo(wp.x, wp.y, wp.z, 2.0, { dig: true, timeoutMs: 15000 });
    } catch (e) {
      console.log(`Ascent WP ${i + 1} note: ${e.message}`);
      try {
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
      } catch (e2) {}
    }
  }

  console.log(`At portal frame! Pos: ${lib.fmt(bot.entity.position)}`);

  // Place lava into sill at (299, 72, -54)
  const sillPos = new Vec3(299, 72, -54);
  const curSill = bot.blockAt(sillPos);
  console.log(`Portal sill block: ${curSill ? curSill.name : 'null'}`);

  if (curSill && curSill.name === 'air') {
    const lb = bot.inventory.items().find(i => i.name === 'lava_bucket');
    if (lb) {
      console.log('Placing lava into sill...');
      await bot.equip(lb, 'hand');
      await bot.lookAt(new Vec3(299.5, 72.1, -54.0), true);
      bot.activateItem();
      await sleep(1000);
      bot.chat('Beta: Placed lava into sill (299, 72, -54)! Quench with water now!');
    }
  }

  // Quench with water if needed
  await sleep(1500);
  const sillAfter = bot.blockAt(sillPos);
  console.log(`Sill after place: ${sillAfter ? sillAfter.name : 'null'}`);
  if (sillAfter && (sillAfter.name === 'lava' || sillAfter.name === 'flowing_lava') && lib.count('water_bucket') > 0) {
    console.log('Quenching lava with Beta water_bucket...');
    const wb = bot.inventory.items().find(i => i.name === 'water_bucket');
    if (wb) {
      await bot.equip(wb, 'hand');
      await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
      bot.activateItem();
      await sleep(1500);

      // Scoop water back
      const bkt = bot.inventory.items().find(i => i.name === 'bucket');
      if (bkt) {
        await bot.equip(bkt, 'hand');
        await bot.lookAt(new Vec3(299.5, 73.0, -54.0), true);
        bot.activateItem();
        await sleep(800);
      }
    }
  }

  const finalSill = bot.blockAt(sillPos);
  console.log(`Final sill block: ${finalSill ? finalSill.name : 'null'}`);
  if (finalSill && finalSill.name === 'obsidian') {
    bot.chat('Beta: OBSIDIAN SILL COMPLETE! Frame 100% restored! Delta ignite portal!');
  }
}

return {
  pos: bot.entity.position,
  lava_bucket: lib.count('lava_bucket'),
  sill: bot.blockAt(new Vec3(299, 72, -54))?.name
};
