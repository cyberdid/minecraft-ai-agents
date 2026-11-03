// programs/885-explore-covered-tunnel.js
console.log('=== Program 885: Explore Covered Tunnel (z=-131 to -160) ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}

console.log('Beta start pos:', lib.fmt(bot.entity.position));

// Advance along covered tunnel: z=-131 -> -140 -> -150 -> -160
const tunnelWps = [
  new Vec3(44, 65, -138),
  new Vec3(44, 65, -145),
  new Vec3(44, 65, -155),
  new Vec3(44, 65, -165)
];

for (let i = 0; i < tunnelWps.length && !checkCancelled(); i++) {
  const wp = tunnelWps[i];
  console.log(`Walking to tunnel WP ${i + 1}/${tunnelWps.length}: ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 1.5, { dig: false, timeoutMs: 6000 });
  } catch (e) {
    console.log(`Tunnel step note: ${e.message}`);
    try { await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.5)); } catch (e2) {}
  }

  console.log(`Current pos: ${lib.fmt(bot.entity.position)}`);

  // Scan for Piglins nearby
  const piglins = Object.values(bot.entities).filter(e =>
    e.isValid &&
    e.name === 'piglin' &&
    bot.entity.position.distanceTo(e.position) <= 16
  );

  if (piglins.length > 0) {
    console.log(`Found ${piglins.length} Piglins near ${lib.fmt(bot.entity.position)}:`);
    for (const pig of piglins) {
      console.log(`  Piglin at ${lib.fmt(pig.position)} (dist: ${bot.entity.position.distanceTo(pig.position).toFixed(1)}m)`);
    }

    // If we have gold ingots, barter!
    const gold = bot.inventory.items().find(i => i.name === 'gold_ingot');
    if (gold) {
      piglins.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
      const targetPiglin = piglins[0];
      console.log(`Bartering with Piglin at ${lib.fmt(targetPiglin.position)}...`);
      bot.chat(`Beta: Bartering gold ingot with neutral Piglin at ${lib.fmt(targetPiglin.position)}!`);

      await bot.lookAt(targetPiglin.position.offset(0, 1.0, 0), true);
      await bot.toss(gold.type, null, 1);
      console.log('Tossed gold ingot! Waiting 7.5s for barter drop...');
      await sleep(7500);

      // Vacuum drops
      await lib.pickup(5.0);
      const pearls = lib.count('ender_pearl');
      console.log(`Ender pearls after barter: ${pearls}`);
      if (pearls > 0) {
        bot.chat(`Beta: HARVESTED ${pearls} ENDER PEARL(S)! Milestone 9 progress!`);
      }
    }
    break;
  }
}

// Teammate positions
for (const [name, pl] of Object.entries(bot.players)) {
  if (name === bot.username) continue;
  if (pl && pl.entity) {
    console.log(`Player ${name} at ${lib.fmt(pl.entity.position)}`);
  }
}

console.log('Inventory summary:', JSON.stringify(lib.inv()));
return {
  pos: bot.entity.position,
  hp: bot.health,
  ender_pearls: lib.count('ender_pearl'),
  gold_ingots: lib.count('gold_ingot')
};
