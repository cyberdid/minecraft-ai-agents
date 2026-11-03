// programs/855-flawless-lava-scoop-and-portal-repair.js
console.log('=== Program 855: Flawless Lava Scoop & Portal Sill Repair ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Defend if any hostiles
const hostiles = lib.hostiles(6);
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

// 1. Exit base shelter
console.log('Exiting base door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try { await lib.goTo(294, 72, -52, 1.2, { timeoutMs: 4000 }); } catch (e2) {}
}

console.log(`Outside base! Pos: ${lib.fmt(bot.entity.position)}`);

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = false;
moves.liquidsCost = 50;
bot.pathfinder.setMovements(moves);

// 2. Descend down shaft to lava lake
bot.chat('Beta: Descending to lava lake at y=18 to scoop lava bucket!');

const descentWps = [
  new Vec3(302, 71, -44),
  new Vec3(302, 57, -45),
  new Vec3(301, 45, -39),
  new Vec3(303, 30, -39),
  new Vec3(303, 18, -40),
  new Vec3(300, 18, -24),
  new Vec3(296, 17, -8),
  new Vec3(289, 19, 7),
  new Vec3(283.5, 19, 6.5)
];

for (let i = 0; i < descentWps.length; i++) {
  if (checkCancelled()) break;
  const wp = descentWps[i];
  console.log(`Descent WP ${i + 1}/${descentWps.length}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.5, { dig: true, timeoutMs: 14000 });
  } catch (e) {
    console.log(`Descent WP ${i + 1} note: ${e.message}`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
    } catch (e2) {}
  }
}

console.log(`Arrived at lava lake ledge! Pos: ${lib.fmt(bot.entity.position)}`);

// 3. Scoop lava source at (282, 18, 6)
const lavaTarget = new Vec3(282, 18, 6);
const block = bot.blockAt(lavaTarget);
console.log(`Block at (282, 18, 6): ${block ? block.name : 'null'}, meta: ${block ? block.metadata : 'null'}`);

const bkt = bot.inventory.items().find(i => i.name === 'bucket');
if (bkt) {
  console.log('Equipping bucket and scooping lava...');
  await bot.equip(bkt, 'hand');
  await bot.lookAt(new Vec3(282.5, 18.5, 6.5), true);
  await sleep(300);
  bot.activateItem();
  await sleep(1000);
}

console.log(`Inventory check: lava_bucket=${lib.count('lava_bucket')}`);

// 4. If lava secured, ascend back to surface portal
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
      await lib.goTo(wp.x, wp.y, wp.z, 1.5, { dig: true, timeoutMs: 14000 });
    } catch (e) {
      console.log(`Ascent WP ${i + 1} note: ${e.message}`);
      try {
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5));
      } catch (e2) {}
    }
  }

  console.log(`At portal frame area! Pos: ${lib.fmt(bot.entity.position)}`);

  // STRICT SAFETY CHECK: only place if distance to sill <= 3.5m!
  const sillPos = new Vec3(299, 72, -54);
  const distToSill = bot.entity.position.distanceTo(sillPos);
  console.log(`Distance to portal sill: ${distToSill.toFixed(2)}m`);

  if (distToSill <= 3.5) {
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
        bot.chat('Beta: PLACED LAVA into sill at (299, 72, -54)! Quench with water now!');
      }
    }

    // Quench with water if needed
    await sleep(1500);
    const sillAfter = bot.blockAt(sillPos);
    console.log(`Sill after place: ${sillAfter ? sillAfter.name : 'null'}`);
    if (sillAfter && (sillAfter.name === 'lava' || sillAfter.name === 'flowing_lava') && lib.count('water_bucket') > 0) {
      console.log('Quenching lava with water_bucket...');
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
  } else {
    console.log(`Too far from sill (${distToSill.toFixed(2)}m > 3.5m) to place lava safely!`);
  }
}

return {
  pos: bot.entity.position,
  lava_bucket: lib.count('lava_bucket'),
  sill: bot.blockAt(new Vec3(299, 72, -54))?.name
};
