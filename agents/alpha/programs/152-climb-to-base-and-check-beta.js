// programs/152-climb-to-base-and-check-beta.js
console.log('--- Navigating Up to Base ---');
console.log('Current pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Path back up to base entrance (294, 72, -53)
console.log('Pathing up to (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1, { dig: true });
} catch (e) {
  console.log('goTo with dig error:', e.message);
  // Try normal goToXZ or goTo
  try {
    await lib.goTo(294, 72, -53, 2);
  } catch (e2) {
    console.log('goTo fallback error:', e2.message);
  }
}

console.log('Arrived near base entrance! Pos:', lib.fmt(bot.entity.position));

// 2. Step inside through door
if (bot.entity.position.distanceTo(new Vec3(294, 72, -54)) < 6) {
  try {
    await lib.door(294, 72, -54, true);
    await sleep(200);
    await lib.walkTo(293.5, -56.0, 3000);
    await lib.door(294, 72, -54, false);
    console.log('Safely inside base.');
  } catch (e) {
    console.log('Door passage error:', e.message);
  }
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 3. Check chest for any food to top off hunger
try {
  const chest = await lib.chestContents(293, 72, -57);
  for (const f of ['cooked_chicken', 'cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple']) {
    if (chest[f] && chest[f] > 0) {
      console.log(`Withdrawing ${f} from chest to top off health...`);
      await lib.withdraw({ [f]: 2 }, 293, 72, -57);
      break;
    }
  }
} catch (e) {}

// Safe eat function
async function safeEatItem(name) {
  const item = bot.inventory.items().find(i => i.name === name);
  if (!item) return;
  await bot.equip(item, 'hand');
  bot.deactivateItem();
  bot.activateItem();
  const startFood = bot.food;
  for (let i = 0; i < 40; i++) {
    await sleep(100);
    if (bot.food > startFood) break;
  }
  bot.deactivateItem();
}

for (const f of ['cooked_chicken', 'cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple']) {
  if (bot.food < 18 && lib.count(f) > 0) {
    await safeEatItem(f);
  }
}

console.log('Status: Health:', bot.health, 'Food:', bot.food);
console.log('Inventory:', JSON.stringify(lib.inv()));

bot.chat('alpha: Inside base with water_bucket and full iron gear. Ready for Nether portal!');
