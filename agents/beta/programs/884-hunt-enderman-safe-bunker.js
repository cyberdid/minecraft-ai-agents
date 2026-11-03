// programs/884-hunt-enderman-safe-bunker.js
console.log('=== Program 884: Safe Enderman Hunt from 2-High Bunker ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure iron sword equipped
const sword = bot.inventory.items().find(i => i.name === 'iron_sword') || bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (sword) await bot.equip(sword, 'hand');

// Stand at safe 2-high bunker spot (44, 65, -131)
const bunkerPos = new Vec3(44, 65, -131);
try {
  await lib.goTo(bunkerPos.x, bunkerPos.y, bunkerPos.z, 0.5, { dig: false, timeoutMs: 3000 });
} catch (e) {}

// Verify 2-high ceiling over Beta
const ceiling = bot.blockAt(bunkerPos.offset(0, 2, 0));
console.log(`Ceiling block above head: ${ceiling ? ceiling.name : 'null'} (solid: ${ceiling?.boundingBox === 'block'})`);

// Find Endermen within 48m
const endermen = Object.values(bot.entities).filter(e =>
  e.isValid &&
  e.name === 'enderman' &&
  bot.entity.position.distanceTo(e.position) <= 48
);

console.log(`Found ${endermen.length} Endermen:`);
for (const end of endermen) {
  console.log(`  Enderman at ${lib.fmt(end.position)} (dist: ${bot.entity.position.distanceTo(end.position).toFixed(1)}m)`);
}

if (endermen.length > 0) {
  const target = endermen[0];
  console.log(`Staring at Enderman head at ${lib.fmt(target.position)} to provoke aggro...`);
  bot.chat('Beta: Provoking Enderman from behind 2-high blast-proof bunker ceiling!');

  // Look directly at head to aggro
  await bot.lookAt(target.position.offset(0, 2.7, 0), true);
  await sleep(1000);

  // Wait for Enderman to teleport or run into melee reach (dist <= 3.5m)
  const startWait = Date.now();
  let attacked = false;

  while (Date.now() - startWait < 15000 && !checkCancelled()) {
    const end = Object.values(bot.entities).find(e => e.id === target.id || (e.name === 'enderman' && e.isValid && bot.entity.position.distanceTo(e.position) <= 4.0));
    if (end) {
      const dist = bot.entity.position.distanceTo(end.position);
      if (dist <= 3.8) {
        console.log(`Enderman in melee reach (${dist.toFixed(1)}m)! Striking with sword...`);
        await bot.lookAt(end.position.offset(0, 1.5, 0), true);
        bot.attack(end);
        attacked = true;
        await sleep(650);
      } else {
        // Keep staring at head
        await bot.lookAt(end.position.offset(0, 2.7, 0), true);
        await sleep(300);
      }
    } else if (attacked) {
      console.log('Target Enderman slain!');
      break;
    } else {
      await sleep(300);
    }
  }

  // Vacuum drops
  await lib.pickup(5.0);
}

const pearls = lib.count('ender_pearl');
console.log(`Enderman hunt complete! Ender Pearls in inventory: ${pearls}`);
if (pearls > 0) {
  bot.chat(`Beta: SUCCESS! Harvested ${pearls} Ender Pearl(s)! Milestone 9 progress!`);
}

return {
  pos: bot.entity.position,
  hp: bot.health,
  ender_pearls: lib.count('ender_pearl')
};
