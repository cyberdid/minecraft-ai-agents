// programs/540-obtain-food-and-heal.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: OBTAIN FOOD & RESTORE HEALTH ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

// Step 1: Check teammates in base
for (const name of ['alpha', 'beta', 'gamma']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist: ${bot.entity.position.distanceTo(p.entity.position).toFixed(1)})`);
  }
}

// Pickup any items dropped in base
try { await lib.pickup(4); } catch (e) {}

// Check chest for food
const cBlock = bot.blockAt(new Vec3(293, 72, -57));
if (cBlock) {
  try {
    const chest = await bot.openChest(cBlock);
    const f = chest.containerItems().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato', 'cooked_chicken'].includes(i.name));
    if (f) {
      console.log(`Taking ${f.name} x${f.count} from chest...`);
      await chest.withdraw(f.type, null, f.count);
    }
    chest.close();
  } catch (e) {}
}

// Check if we have edible food
let edible = bot.inventory.items().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato', 'cooked_chicken'].includes(i.name));
if (edible) {
  console.log(`Eating ${edible.name}...`);
  await bot.equip(edible, 'hand');
  await bot.consume();
}

// If still hungry, hunt peaceful mobs
if (bot.food < 15) {
  console.log('Food still low. Scanning for mobs to hunt...');
  const mobs = Object.values(bot.entities).filter(e =>
    ['chicken', 'sheep', 'pig', 'cow'].includes(e.name) &&
    bot.entity.position.distanceTo(e.position) < 80
  ).sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  console.log(`Found ${mobs.length} animals within 80m.`);
  if (mobs.length > 0) {
    const target = mobs[0];
    console.log(`Hunting ${target.name} at ${lib.fmt(target.position)}...`);
    try {
      await lib.equipWeapon();
      await bot.pathfinder.goto(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 2));
      bot.attack(target);
      await sleep(600);
      bot.attack(target);
      await sleep(600);
      await lib.pickup(5);
    } catch (e) {
      console.log('Hunting note:', e.message);
    }
  } else {
    // Try lib.obtain
    try {
      console.log('Calling lib.obtain(cooked_chicken, 1)...');
      await lib.obtain('cooked_chicken', 1);
    } catch (e) {
      console.log('lib.obtain chicken error:', e.message);
    }
  }
}

// Check for raw meat and cook it
const raw = bot.inventory.items().find(i => ['raw_chicken', 'chicken', 'mutton', 'beef', 'porkchop'].includes(i.name));
if (raw) {
  console.log(`Smelting raw meat: ${raw.name} x${raw.count}...`);
  const fb = bot.blockAt(new Vec3(295, 72, -55));
  if (fb) {
    try {
      const furnace = await bot.openFurnace(fb);
      await furnace.putInput(raw.type, null, raw.count);
      // Put plank as fuel
      const plank = bot.inventory.items().find(i => i.name.includes('planks'));
      if (plank) {
        await furnace.putFuel(plank.type, null, 1);
      }
      furnace.close();
      console.log('Cooking in furnace, waiting 10s...');
      await sleep(10000);
      const f2 = await bot.openFurnace(fb);
      const out = f2.outputItem();
      if (out) {
        console.log(`Taking cooked food: ${out.name} x${out.count}`);
        await f2.takeOutput();
      }
      f2.close();
    } catch (e) {
      console.log('Smelting error:', e.message);
    }
  }
}

// Eat cooked food
const foodToEat = bot.inventory.items().find(i => ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'baked_potato', 'cooked_chicken'].includes(i.name));
if (foodToEat) {
  console.log(`Eating ${foodToEat.name}...`);
  await bot.equip(foodToEat, 'hand');
  await bot.consume();
}

console.log('=== FOOD & HEALTH STATUS ===');
console.log(`HP: ${bot.health}, Food: ${bot.food}`);
console.log(`Inventory:`, JSON.stringify(lib.inv()));

return {
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
