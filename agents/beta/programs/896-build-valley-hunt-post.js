// programs/896-build-valley-hunt-post.js
console.log('=== Program 896: Build Soul Sand Valley Enderman Hunt Post ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

console.log('Beta pos:', lib.fmt(bot.entity.position), 'cobblestone:', lib.count('cobblestone'));

// Ask Gamma for food
bot.chat('Beta: Gamma, I am at 1/20 food. If you have cooked food, please toss 2 to me!');

// 1. Build 2-high roof over (53, 65, -6) and (54, 65, -6) at y=67
const roofBlocks = [
  new Vec3(53, 67, -6),
  new Vec3(54, 67, -6),
  new Vec3(53, 67, -7),
  new Vec3(54, 67, -7)
];

const pick = bot.inventory.items().find(i => i.name.endsWith('_pickaxe'));
for (const rp of roofBlocks) {
  const b = bot.blockAt(rp);
  if (!b || b.boundingBox !== 'block') {
    const mat = bot.inventory.items().find(i => i.name === 'cobblestone' || i.name === 'netherrack');
    if (mat) {
      try {
        await lib.place(mat.name, rp.x, rp.y, rp.z);
        console.log(`Placed protective roof block at ${lib.fmt(rp)}`);
      } catch (e) {}
    }
  }
}

// 2. Stand securely under 2-high roof at (53, 65, -6)
await lib.goTo(53, 65, -6, 0.5, { timeoutMs: 3000 });

// 3. Scan Soul Sand Valley for Endermen within 48m
const endermen = Object.values(bot.entities).filter(e =>
  e.isValid &&
  e.name === 'enderman' &&
  bot.entity.position.distanceTo(e.position) <= 48
);

console.log(`Endermen detected in Soul Sand Valley: ${endermen.length}:`);
for (const end of endermen) {
  console.log(`  Enderman at ${lib.fmt(end.position)} (dist: ${bot.entity.position.distanceTo(end.position).toFixed(1)}m)`);
}

// 4. Provoke and slay
const sword = bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (endermen.length > 0) {
  const target = endermen[0];
  console.log(`Provoking Enderman at ${lib.fmt(target.position)}...`);
  bot.chat(`Beta: Provoking Enderman at ${lib.fmt(target.position)} from Valley Hunting Post!`);

  await bot.lookAt(target.position.offset(0, 2.7, 0), true);
  await sleep(1000);

  const startW = Date.now();
  let killed = false;
  while (Date.now() - startW < 12000 && !checkCancelled()) {
    const nearEnd = Object.values(bot.entities).find(e =>
      e.isValid && e.name === 'enderman' && bot.entity.position.distanceTo(e.position) <= 3.8
    );
    if (nearEnd) {
      if (sword) await bot.equip(sword, 'hand');
      await bot.lookAt(nearEnd.position.offset(0, 1.5, 0), true);
      bot.attack(nearEnd);
      await sleep(650);
      if (nearEnd.health !== undefined && nearEnd.health <= 0) {
        killed = true;
        break;
      }
    } else {
      await sleep(250);
    }
  }

  // Vacuum drops
  await lib.pickup(5.0);
}

const pearls = lib.count('ender_pearl');
console.log(`Ender pearls in inventory: ${pearls}`);
if (pearls > 0) {
  bot.chat(`Beta: ENDER PEARL HARVESTED! Total pearls: ${pearls}/12!`);
}

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  endermen: endermen.length,
  ender_pearls: pearls
};
