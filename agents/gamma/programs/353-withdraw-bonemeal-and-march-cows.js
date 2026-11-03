// programs/353-withdraw-bonemeal-and-march-cows.js
console.log('=== FOOD EXPEDITION: BONE MEAL + COW PASTURE MARCH ===');
console.log('Current food:', bot.food, 'HP:', bot.health, 'Pos:', lib.fmt(bot.entity.position));

// Step 1: Withdraw bone meal from chest
try {
  const contents = await lib.chestContents(293, 72, -57);
  if (contents && contents.bone_meal > 0) {
    await lib.withdraw({ bone_meal: contents.bone_meal }, 293, 72, -57);
    console.log(`Withdrew ${contents.bone_meal} bone_meal!`);
  }
} catch (e) {
  console.log('Chest withdraw note:', e.message);
}

// Step 2: Ensure we have sticks and craft stone hoe
if (lib.count('stick') < 2) {
  try { await lib.craft('stick', 4); } catch (e) {}
}
if (lib.count('stone_hoe') === 0 && lib.count('cobblestone') >= 2) {
  try {
    await lib.craft('stone_hoe', 1);
    console.log('Crafted stone_hoe!');
  } catch (e) {
    console.log('Craft hoe note:', e.message);
  }
}

// Step 3: Exit base
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.walkTo(294.5, -52.5, 3000);
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

// Step 4: Break a few grass tufts right outside base for seeds
const grassBlocks = bot.findBlocks({
  matching: b => b && (b.name === 'grass' || b.name === 'short_grass' || b.name === 'tall_grass'),
  maxDistance: 12,
  count: 10
});
for (const gp of grassBlocks) {
  if (lib.count('wheat_seeds') >= 3 || isCancelled()) break;
  try {
    const b = bot.blockAt(gp);
    if (b) {
      await bot.lookAt(gp.offset(0.5, 0.5, 0.5));
      await bot.dig(b);
      await sleep(100);
      await lib.pickup(3);
    }
  } catch (e) {}
}
console.log('Seeds in inventory:', lib.count('wheat_seeds'));

// Step 5: March along the cow pasture route: (294, 72, -30) -> (305, 68, 20) -> (317, 71, 85)
const route = [
  new Vec3(294, 72, -30),
  new Vec3(305, 70, 0),
  new Vec3(310, 68, 35),
  new Vec3(315, 70, 65),
  new Vec3(317, 71, 85)
];

const meatTypes = ['beef', 'mutton', 'porkchop', 'chicken'];
let meatCount = () => meatTypes.reduce((acc, m) => acc + lib.count(m), 0);

for (const wp of route) {
  if (isCancelled() || lib.time().secondsUntilNight < 150) break;
  console.log(`Walking towards ${lib.fmt(wp)}...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 3, { timeoutMs: 15000 });
  } catch (e) {
    console.log(`Navigation to ${lib.fmt(wp)} note:`, e.message);
  }

  // Scan for animals
  const targets = Object.values(bot.entities)
    .filter(e => e && ['cow', 'sheep', 'pig', 'chicken'].includes(e.name) && e.position.distanceTo(bot.entity.position) < 40)
    .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

  if (targets.length > 0) {
    console.log(`Found ${targets.length} animals! Nearest is ${targets[0].name} at ${lib.fmt(targets[0].position)}`);
    for (const target of targets.slice(0, 3)) {
      if (!target.isValid) continue;
      console.log(`Hunting ${target.name}...`);
      try {
        await bot.pathfinder.goto(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 2));
        await lib.equipWeapon();
        const deadline = Date.now() + 6000;
        while (target.isValid && Date.now() < deadline) {
          bot.attack(target);
          await sleep(600);
        }
        await lib.pickup(6);
      } catch (err) {
        console.log('Attack error:', err.message);
      }
      if (meatCount() >= 4) break;
    }
  }

  if (meatCount() >= 4) {
    console.log('Gathered sufficient meat!');
    break;
  }
}

console.log('--- Step 6: Cook meat on site and eat ---');
const rawFound = meatTypes.filter(m => lib.count(m) > 0);
console.log('Raw meats:', rawFound.map(m => `${m}x${lib.count(m)}`).join(', '));

if (rawFound.length > 0) {
  for (const m of rawFound) {
    const qty = lib.count(m);
    try {
      console.log(`Smelting ${qty}x ${m}...`);
      await lib.smelt(m, 'birch_planks', qty);
    } catch (e) {
      console.log(`Smelt ${m} error:`, e.message);
    }
  }

  // Eat
  for (let i = 0; i < 4; i++) {
    try { await lib.eat(); } catch (e) { break; }
  }
}

console.log('Status after hunt/eat:', JSON.stringify(lib.status()));
