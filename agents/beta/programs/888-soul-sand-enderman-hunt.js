// programs/888-soul-sand-enderman-hunt.js
console.log('=== Program 888: Soul Sand Valley Enderman Safe Hunt ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots on feet for Piglin neutrality
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}

// Equip iron sword
const sword = bot.inventory.items().find(i => i.name === 'iron_sword') || bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (sword) await bot.equip(sword, 'hand');

console.log('Beta start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Walk back along covered tunnel to Fortress Workshop Bunker (44, 65, -127)
const returnWps = [
  new Vec3(38, 65, -176),
  new Vec3(44, 65, -169),
  new Vec3(44, 65, -145),
  new Vec3(44, 65, -127),
  new Vec3(50, 65, -115) // Overlooking Soul Sand Valley
];

for (let i = 0; i < returnWps.length && !checkCancelled(); i++) {
  const wp = returnWps[i];
  console.log(`Advancing to ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.5, { dig: false, timeoutMs: 6000 });
  } catch (e) {
    try { await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5)); } catch (e2) {}
  }
}

console.log(`At hunting station: ${lib.fmt(bot.entity.position)}`);

// 2. Ensure 2-high protective ceiling over player
const curP = bot.entity.position;
const ceilingPos = new Vec3(Math.floor(curP.x), Math.floor(curP.y) + 2, Math.floor(curP.z));
const ceilBlock = bot.blockAt(ceilingPos);
console.log(`Ceiling block above head: ${ceilBlock ? ceilBlock.name : 'null'}`);

if (!ceilBlock || ceilBlock.boundingBox !== 'block') {
  const mat = bot.inventory.items().find(i => i.name === 'cobblestone' || i.name === 'netherrack');
  if (mat) {
    console.log('Building 2-high protective ceiling block above head...');
    try {
      await lib.place(mat.name, ceilingPos.x, ceilingPos.y, ceilingPos.z);
    } catch (e) {}
  }
}

// 3. Scan for Endermen in Soul Sand Valley within 48m
const endermen = Object.values(bot.entities).filter(e =>
  e.isValid &&
  e.name === 'enderman' &&
  bot.entity.position.distanceTo(e.position) <= 48
);

console.log(`Endermen detected in Soul Sand Valley: ${endermen.length}`);
for (const end of endermen) {
  console.log(`  Enderman at ${lib.fmt(end.position)} (dist: ${bot.entity.position.distanceTo(end.position).toFixed(1)}m)`);
}

// 4. Provoke and slay Endermen safely
let killed = 0;
for (const end of endermen) {
  if (checkCancelled()) break;
  if (!end.isValid) continue;

  console.log(`Provoking Enderman at ${lib.fmt(end.position)} by staring at head...`);
  bot.chat(`Beta: Provoking Enderman at ${lib.fmt(end.position)} from under 2-high protective ceiling!`);

  await bot.lookAt(end.position.offset(0, 2.7, 0), true);
  await sleep(1000);

  // Wait for Enderman to teleport or run into melee reach (dist <= 3.8m)
  const startWait = Date.now();
  let engaged = false;

  while (Date.now() - startWait < 12000 && !checkCancelled()) {
    const target = Object.values(bot.entities).find(e =>
      e.isValid && e.name === 'enderman' && bot.entity.position.distanceTo(e.position) <= 4.0
    );

    if (target) {
      const dist = bot.entity.position.distanceTo(target.position);
      if (dist <= 3.8) {
        if (sword) await bot.equip(sword, 'hand');
        await bot.lookAt(target.position.offset(0, 1.5, 0), true);
        bot.attack(target);
        engaged = true;
        await sleep(650);
        if (target.health !== undefined && target.health <= 0) {
          killed++;
          console.log(`Enderman slain! Kills: ${killed}`);
          break;
        }
      }
    } else if (engaged) {
      killed++;
      console.log(`Enderman slain! Total kills: ${killed}`);
      break;
    } else {
      await sleep(250);
    }
  }

  // Vacuum drops
  await lib.pickup(5.0);
}

const pearls = lib.count('ender_pearl');
console.log(`Hunt cycle complete! Kills: ${killed}, Ender Pearls in inv: ${pearls}`);
bot.chat(`Beta: Enderman hunt report — Kills: ${killed}, Ender Pearls in inventory: ${pearls}/12`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  killed: killed,
  ender_pearls: pearls
};
