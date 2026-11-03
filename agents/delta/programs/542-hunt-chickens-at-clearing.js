// programs/542-hunt-chickens-at-clearing.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: HUNT CHICKENS & COOK FOOD ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

// Step 1: March towards (355, 72, 10)
console.log('Marching towards chicken flock at (355, 72, 10)...');
try {
  await lib.goTo(355, 72, 10, 8, { timeoutMs: 25000 });
} catch (e) {
  console.log('goTo notice:', e.message);
}

// Step 2: Find chickens and hunt them
console.log('Locating chickens...');
for (let round = 0; round < 3 && lib.count('*chicken') < 3; round++) {
  const chickens = Object.values(bot.entities).filter(e =>
    e.name === 'chicken' && e.isValid && bot.entity.position.distanceTo(e.position) < 32
  ).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  if (chickens.length > 0) {
    const ch = chickens[0];
    console.log(`Targeting chicken at ${lib.fmt(ch.position)} (dist: ${bot.entity.position.distanceTo(ch.position).toFixed(1)})...`);
    try {
      await lib.equipWeapon();
      await bot.pathfinder.goto(new goals.GoalNear(ch.position.x, ch.position.y, ch.position.z, 1.8));
      await bot.lookAt(ch.position.offset(0, ch.height * 0.5, 0), true);
      bot.attack(ch);
      await sleep(600);
      await lib.pickup(4);
    } catch (e) {
      console.log('Attack notice:', e.message);
    }
  } else {
    console.log('No chicken in 32m, scanning 50m...');
    const farCh = Object.values(bot.entities).find(e => e.name === 'chicken' && e.isValid);
    if (farCh) {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(farCh.position.x, farCh.position.y, farCh.position.z, 2));
      } catch (e) {}
    } else {
      break;
    }
  }
}

try { await lib.pickup(5); } catch (e) {}
console.log(`Meat in inventory: raw_chicken=${lib.count('raw_chicken') || lib.count('chicken')}`);

// Step 3: Return to base
console.log('Returning to base at (293, 72, -55)...');
try {
  await lib.goTo(293, 72, -55, 2, { timeoutMs: 25000 });
} catch (e) {
  console.log('Return notice:', e.message);
}

if (bot.entity.position.z > -54.0) {
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {}
}

// Step 4: Cook meat in furnace
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

      console.log('Waiting 10s for food to cook...');
      await sleep(10000);

      const f2 = await bot.openFurnace(fb);
      const cooked = f2.outputItem();
      if (cooked) {
        console.log(`Taking cooked food: ${cooked.name} x${cooked.count}`);
        await f2.takeOutput();
      }
      f2.close();
    } catch (e) {
      console.log('Furnace cook error:', e.message);
    }
  }
}

// Step 5: Eat cooked food!
const cookedItem = bot.inventory.items().find(i => ['cooked_chicken', 'cooked_beef', 'cooked_mutton', 'cooked_porkchop'].includes(i.name));
if (cookedItem) {
  console.log(`EATING ${cookedItem.name}...`);
  await bot.equip(cookedItem, 'hand');
  await bot.consume();
}

console.log('=== HUNT & FEAST COMPLETE ===');
console.log(`HP: ${bot.health}, Food: ${bot.food}`);
console.log(`Inventory:`, JSON.stringify(lib.inv()));

return {
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
