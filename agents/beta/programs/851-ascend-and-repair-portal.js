// programs/851-ascend-and-repair-portal.js
console.log('=== Program 851: Ascend with Lava Bucket & Restore Nether Portal ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Defend against immediate hostiles
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

console.log('Current pos:', lib.fmt(bot.entity.position), 'lava_bucket:', lib.count('lava_bucket'));

const moves = new Movements(bot, mcData);
moves.canDig = true;
moves.allowParkour = false;
moves.liquidsCost = 50;
bot.pathfinder.setMovements(moves);

bot.chat('Beta: Ascending mine shaft with lava bucket now!');

// Short segment waypoints to prevent pathfinding timeout
const ascentWps = [
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
  console.log(`Ascending to WP ${i + 1}/${ascentWps.length}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.0, { dig: true, timeoutMs: 12000 });
  } catch (e) {
    console.log(`Ascent WP ${i + 1} note: ${e.message}`);
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
    } catch (e2) {}
  }
  console.log(`Current pos: ${lib.fmt(bot.entity.position)}`);
}

console.log(`Arrived near portal frame! Pos: ${lib.fmt(bot.entity.position)}`);

// Check sill block at (299, 72, -54)
const sillPos = new Vec3(299, 72, -54);
const curSill = bot.blockAt(sillPos);
console.log(`Portal sill block before place: ${curSill ? curSill.name : 'null'}`);

if (curSill && curSill.name === 'air' && lib.count('lava_bucket') > 0) {
  console.log('Placing lava into sill at (299, 72, -54)...');
  const lb = bot.inventory.items().find(i => i.name === 'lava_bucket');
  if (lb) {
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
console.log(`Final sill block at (299, 72, -54): ${finalSill ? finalSill.name : 'null'}`);

if (finalSill && finalSill.name === 'obsidian') {
  bot.chat('Beta: SUCCESS! Obsidian sill is cast at (299, 72, -54)! Portal frame 100% complete! Delta ignite!');
}

return {
  pos: bot.entity.position,
  sill: finalSill ? finalSill.name : 'null',
  lava_bucket: lib.count('lava_bucket')
};
