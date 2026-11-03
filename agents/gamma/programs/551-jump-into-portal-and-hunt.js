// programs/551-jump-into-portal-and-hunt.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 551: JUMP INTO PORTAL & JOIN ENDERMAN HUNT ===');
console.log('Start Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Step directly into active portal block at (299.5, 73.0, -53.5)
if (bot.game.dimension === 'overworld') {
  console.log('Jumping onto portal sill at (299.5, 73.0, -53.5)...');
  const target = new Vec3(299.5, 73.0, -53.5);
  await bot.lookAt(target, true);

  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  await sleep(400);
  bot.setControlState('forward', false);

  bot.pathfinder.stop();
  bot.clearControlStates();

  console.log('Inside portal frame! Pos:', lib.fmt(bot.entity.position), 'Awaiting warp...');
  bot.chat('gamma: Inside active Nether portal frame! Warping to Nether to join Beta for Milestone 9!');

  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - 299.5) > 0.4 || Math.abs(cur.z - (-53.5)) > 0.4 || cur.y < 72.8) {
      await bot.lookAt(target, true);
      bot.setControlState('forward', true);
      if (cur.y < 72.8) bot.setControlState('jump', true);
      await sleep(200);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(250);
  }
}

// Step 2: In Nether
if (bot.game.dimension !== 'the_nether') {
  console.log('Still in Overworld, stopping.');
  return { dimension: bot.game.dimension, pos: bot.entity.position };
}

console.log('SUCCESS: Warped to the_nether! Pos:', lib.fmt(bot.entity.position));
await sleep(400);
// Step forward into Nether bunker
await bot.lookAt(new Vec3(46.0, 65.0, -7.0), true);
bot.setControlState('forward', true);
await sleep(1000);
bot.setControlState('forward', false);

bot.chat(`gamma: In the_nether at ${lib.fmt(bot.entity.position)}! Marching to East Ridge to hunt Endermen with Beta!`);

// Step 3: March safe waypoints WP 0 -> WP 4 where Beta is hunting Endermen at (48, 75, -40)
globalThis.configureFireAvoidance();
const huntWps = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 }
];

for (let i = 0; i < huntWps.length && !isCancelled(); i++) {
  const wp = huntWps[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) < 2.0) continue;

  await globalThis.clearFireAhead();
  await bot.lookAt(new Vec3(wp.x, 64.0, wp.z));

  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.8, { dig: false, timeoutMs: 10000 });
  } catch (e) {
    try {
      await globalThis.clearFireAhead();
      await bot.lookAt(new Vec3(wp.x + 0.5, wp.y + 0.8, wp.z + 0.5), true);
      bot.setControlState('forward', true);
      await sleep(600);
      bot.setControlState('forward', false);
    } catch (e2) {}
  }

  await globalThis.clearFireAhead();
  try { await lib.pickup(3.5); } catch (e) {}

  // Scan for Endermen in Soul Sand Valley
  const endermen = Object.values(bot.entities).filter(e =>
    e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 24
  );

  if (endermen.length > 0) {
    const em = endermen[0];
    console.log(`Enderman spotted at ${lib.fmt(em.position)}!`);

    // Check if under 2-high cover or build a quick 2-high roof
    const headBlock = bot.blockAt(bot.entity.position.offset(0, 2, 0));
    const isCovered = headBlock && headBlock.name !== 'air';

    if (isCovered || wp.z <= -20) {
      console.log('Engaging Enderman safely from under ceiling!');
      bot.chat(`gamma: Slaying Enderman at ${lib.fmt(bot.entity.position)} for Milestone 9 Ender Pearls!`);

      const sw = bot.inventory.items().find(i => i.name === 'iron_sword');
      if (sw) await bot.equip(sw, 'hand');

      // Look at Enderman eyes to aggro
      await bot.lookAt(em.position.offset(0, 2.8, 0), true);
      await sleep(500);

      const combatStart = Date.now();
      while (Date.now() - combatStart < 10000 && em.isValid && !isCancelled()) {
        const d = bot.entity.position.distanceTo(em.position);
        if (d <= 4.2) {
          bot.attack(em);
          await sleep(650);
        } else {
          await bot.lookAt(em.position.offset(0, 2.8, 0), true);
          await sleep(200);
        }
      }

      await sleep(800);
      await lib.pickup(5.0);
    }
  }

  if (bot.health <= 6) break;
}

const curPearls = lib.count('ender_pearl');
console.log(`=== END 551: Pearls: ${curPearls}/12, Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health.toFixed(1)} ===`);

bot.chat(`gamma: Ridge hunt update — Pearls: ${curPearls}/12, HP: ${bot.health.toFixed(1)}/20.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  pearls: curPearls,
  inv: lib.inv()
};
