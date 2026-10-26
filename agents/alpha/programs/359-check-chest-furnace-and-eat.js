// programs/359-check-chest-furnace-and-eat.js
console.log('=== Program 359: Check Chest, Furnace, Team, and Eat ===');

console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check chest contents
let chestItems = {};
try {
  chestItems = await lib.chestContents(293, 72, -57);
  console.log('Chest (293, 72, -57) contents:', JSON.stringify(chestItems));
} catch (e) {
  console.log('Could not read chest at (293, 72, -57):', e.message);
  // Try finding any chest within 16 blocks
  const chests = bot.findBlocks({ matching: (b) => b && b.name.includes('chest'), maxDistance: 16, count: 5 });
  console.log('Nearby chest positions:', JSON.stringify(chests));
}

// 2. Check furnace at (295, 72, -55)
try {
  const fBlock = bot.blockAt(new Vec3(295, 72, -55));
  if (fBlock) {
    const furnace = await bot.openFurnace(fBlock);
    const inp = furnace.inputItem();
    const fuel = furnace.fuelItem();
    const out = furnace.outputItem();
    console.log('Furnace input:', inp ? `${inp.name}x${inp.count}` : 'empty');
    console.log('Furnace fuel:', fuel ? `${fuel.name}x${fuel.count}` : 'empty');
    console.log('Furnace output:', out ? `${out.name}x${out.count}` : 'empty');
    if (out) {
      console.log('Withdrawing output from furnace:', out.name, out.count);
      await furnace.takeOutput();
    }
    furnace.close();
  }
} catch (e) {
  console.log('Furnace check error:', e.message);
}

// 3. Withdraw food from chest if available
const foodNames = ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple', 'baked_potato', 'beef', 'porkchop', 'mutton'];
let foundFood = null;
for (const f of foodNames) {
  if (chestItems[f] && chestItems[f] > 0) {
    foundFood = f;
    break;
  }
}

if (foundFood) {
  console.log(`Found food in chest: ${foundFood} (${chestItems[foundFood]}). Withdrawing...`);
  try {
    await lib.withdraw({ [foundFood]: Math.min(8, chestItems[foundFood]) }, 293, 72, -57);
    console.log('Withdrawn! New inventory:', JSON.stringify(lib.inv()));
  } catch (e) {
    console.log('Withdraw failed:', e.message);
  }
}

// Check inventory for food and eat
const currentFoods = bot.inventory.items().filter(i => foodNames.includes(i.name));
console.log('Current food items in inventory:', currentFoods.map(i => `${i.name}x${i.count}`));

for (const f of currentFoods) {
  while (bot.food < 20 && bot.inventory.count(f.type) > 0) {
    console.log(`Eating ${f.name}... food is ${bot.food}`);
    const ate = await globalThis.safeEat(f.name);
    if (!ate) {
      console.log('safeEat returned false, trying lib.eat...');
      try {
        await lib.eat();
      } catch (e) {
        console.log('lib.eat error:', e.message);
        break;
      }
    }
    console.log(`After eating: food is ${bot.food}, health is ${bot.health}`);
  }
}

// 4. Check teammates
console.log('--- Teammates status ---');
for (const name of ['beta', 'gamma', 'delta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    const pos = p.entity.position;
    const dist = bot.entity.position.distanceTo(pos);
    console.log(`${name}: at ${lib.fmt(pos)}, dist=${dist.toFixed(1)}`);
  } else {
    console.log(`${name}: not visible or no entity`);
  }
}

console.log('Final Alpha status: Health:', bot.health, 'Food:', bot.food, 'Held:', bot.heldItem?.name);
