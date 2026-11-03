// programs/543-slay-chickens-and-cook.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: SLAY CHICKENS & COOK AT BASE ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

// Step 1: Advance to (360, 71, 5)
console.log('Moving to chicken area at (360, 71, 5)...');
try {
  await lib.goTo(360, 71, 5, 4, { timeoutMs: 12000 });
} catch (e) {
  console.log('goTo notice:', e.message);
}

// Step 2: Attack chickens
console.log('Searching for chickens...');
for (let i = 0; i < 4; i++) {
  const chickens = Object.values(bot.entities).filter(e =>
    e.name === 'chicken' && e.isValid && bot.entity.position.distanceTo(e.position) < 20
  ).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  if (chickens.length > 0) {
    const ch = chickens[0];
    console.log(`Attacking chicken at ${lib.fmt(ch.position)}...`);
    await lib.equipWeapon();
    try {
      await bot.pathfinder.goto(new goals.GoalNear(ch.position.x, ch.position.y, ch.position.z, 1.8));
      await bot.lookAt(ch.position.offset(0, ch.height * 0.5, 0), true);
      bot.attack(ch);
      await sleep(500);
      await lib.pickup(3.5);
    } catch (e) {}
  } else {
    // Search up to 35m
    const far = Object.values(bot.entities).find(e => e.name === 'chicken' && e.isValid && bot.entity.position.distanceTo(e.position) < 35);
    if (far) {
      try { await bot.pathfinder.goto(new goals.GoalNear(far.position.x, far.position.y, far.position.z, 2)); } catch (e) {}
    } else {
      break;
    }
  }
}

try { await lib.pickup(5); } catch (e) {}
console.log(`Inventory after hunt:`, JSON.stringify(lib.inv()));

// Step 3: Return to base
console.log('Returning to base (293, 72, -55)...');
try {
  await lib.goTo(293, 72, -55, 2, { timeoutMs: 18000 });
} catch (e) {
  console.log('Return error:', e.message);
  try { await bot.pathfinder.goto(new goals.GoalNear(293, 72, -55, 2)); } catch (e2) {}
}

if (bot.entity.position.z > -54.0) {
  console.log('Entering base door...');
  try { await lib.goThroughDoor(294, 72, -54); } catch (e) {}
}

// Step 4: Cook meat in furnace (295, 72, -55)
const raw = bot.inventory.items().find(i => ['raw_chicken', 'chicken', 'mutton', 'beef', 'porkchop'].includes(i.name));
if (raw) {
  console.log(`Cooking ${raw.name} x${raw.count} in furnace...`);
  const fb = bot.blockAt(new Vec3(295, 72, -55));
  if (fb) {
    try {
      const furnace = await bot.openFurnace(fb);
      await furnace.putInput(raw.type, null, raw.count);
      const fuel = bot.inventory.items().find(i => i.name.includes('planks') || i.name === 'coal');
      if (fuel) await furnace.putFuel(fuel.type, null, 1);
      furnace.close();

      console.log('Cooking in progress... waiting 10s');
      await sleep(10000);

      const f2 = await bot.openFurnace(fb);
      const cooked = f2.outputItem();
      if (cooked) {
        console.log(`Cooked output: ${cooked.name} x${cooked.count}`);
        await f2.takeOutput();
      }
      f2.close();
    } catch (e) {
      console.log('Cooking notice:', e.message);
    }
  }
}

// Step 5: Eat cooked food
const edible = bot.inventory.items().find(i => ['cooked_chicken', 'cooked_beef', 'cooked_mutton', 'cooked_porkchop'].includes(i.name));
if (edible) {
  console.log(`EATING ${edible.name}!`);
  await bot.equip(edible, 'hand');
  await bot.consume();
}

// Ensure shield is in offhand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

console.log('=== STATUS AFTER HUNT ===');
console.log(`Pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);
console.log(`Offhand: ${bot.inventory.slots[45]?.name}, Inv:`, JSON.stringify(lib.inv()));

return {
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
