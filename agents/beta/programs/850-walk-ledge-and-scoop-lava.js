// programs/850-walk-ledge-and-scoop-lava.js
console.log('=== Program 850: Walk Solid Stone Ledge & Scoop Lava ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Defend if zombies are close
const hostiles = lib.hostiles(5);
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

// 1. Walk along dry stone ledge at z=6
const ledgeWps = [
  new Vec3(289, 19, 6),
  new Vec3(285, 19, 6),
  new Vec3(283.5, 19, 6.5)
];

for (const wp of ledgeWps) {
  if (checkCancelled()) break;
  console.log(`Moving to ledge WP ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 0.8, { dig: false, timeoutMs: 8000 });
  } catch (e) {
    console.log(`Ledge WP note: ${e.message}`);
    // Manual step forward
    await bot.lookAt(new Vec3(wp.x, 19.0, wp.z), true);
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);
  }
  console.log(`Pos: ${lib.fmt(bot.entity.position)}`);
}

// 2. Scoop lava at (282, 18, 6)
const targetLava = new Vec3(282, 18, 6);
const block = bot.blockAt(targetLava);
console.log(`Target block at (282, 18, 6): ${block ? block.name : 'null'}, meta: ${block ? block.metadata : 'null'}`);

const bkt = bot.inventory.items().find(i => i.name === 'bucket');
if (bkt) {
  console.log('Equipping bucket and scooping lava...');
  await bot.equip(bkt, 'hand');
  await bot.lookAt(new Vec3(282.5, 18.5, 6.5), true);
  await sleep(200);
  bot.activateItem();
  await sleep(1000);
}

console.log(`Inventory: lava_bucket=${lib.count('lava_bucket')}, bucket=${lib.count('bucket')}`);

// 3. Ascend to surface if lava secured!
if (lib.count('lava_bucket') > 0) {
  bot.chat('Beta: LAVA BUCKET SECURED! Ascending to portal frame at (299, 72, -54)!');

  const ascentWps = [
    new Vec3(289, 19, 6),
    new Vec3(292, 19, 7),
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
    }
  }

  console.log(`At surface! Pos: ${lib.fmt(bot.entity.position)}`);

  // Place lava into sill at (299, 72, -54)
  const sillPos = new Vec3(299, 72, -54);
  const curSill = bot.blockAt(sillPos);
  console.log(`Portal sill block before place: ${curSill ? curSill.name : 'null'}`);

  if (curSill && curSill.name === 'air') {
    const lb = bot.inventory.items().find(i => i.name === 'lava_bucket');
    if (lb) {
      console.log('Placing lava into sill...');
      await bot.equip(lb, 'hand');
      await bot.lookAt(new Vec3(299.5, 72.1, -54.0), true);
      bot.activateItem();
      await sleep(1000);
      bot.chat('Beta: Placed lava into sill at (299, 72, -54)! Quench with water now!');
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
      const emptyB = bot.inventory.items().find(i => i.name === 'bucket');
      if (emptyB) {
        await bot.equip(emptyB, 'hand');
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

return {
  pos: bot.entity.position,
  lava_bucket: lib.count('lava_bucket'),
  sill: bot.blockAt(new Vec3(299, 72, -54))?.name
};
