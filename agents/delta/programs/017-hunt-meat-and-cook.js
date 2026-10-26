// programs/017-hunt-meat-and-cook.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

const doorPos = new Vec3(294, 72, -54);
const chestPos = new Vec3(293, 72, -57);

// Step outside base
console.log('Exiting base to hunt for meat...');
await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);

// Equip sword
await lib.equipWeapon();

// Hunt animals
const targets = ['cow', 'pig', 'sheep'];
let hunted = 0;
for (const mob of targets) {
  if (isCancelled() || lib.time().secondsUntilNight < 180) break;
  try {
    console.log(`Searching and hunting ${mob}...`);
    const r = await lib.hunt(mob, 2);
    console.log(`Hunted ${mob}:`, JSON.stringify(r));
    hunted += r.killed;
    if (hunted >= 3) break;
  } catch (e) {
    console.log(`Hunt ${mob} note:`, e.message);
  }
}

// Return to base
console.log('Returning inside base...');
await lib.goTo(doorPos.x, doorPos.y, doorPos.z, 2);
await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);

console.log('Inside base. Inv now:', JSON.stringify(lib.inv()));

// Find raw meat
const rawItems = Object.keys(lib.inv()).filter(k => 
  ['beef', 'raw_beef', 'porkchop', 'raw_porkchop', 'mutton', 'raw_mutton', 'chicken', 'raw_chicken'].includes(k)
);

for (const raw of rawItems) {
  const count = lib.inv()[raw];
  if (count > 0) {
    console.log(`Smelting ${count} of ${raw}...`);
    try {
      const smeltRes = await lib.smelt(raw, 'oak_planks', count);
      console.log('Smelted:', JSON.stringify(smeltRes));
    } catch (err) {
      console.log('Smelt error:', err.message);
    }
  }
}

console.log('Inv after smelting:', JSON.stringify(lib.inv()));

// Deposit cooked food into chest
const cookedFoods = {};
for (const [k, v] of Object.entries(lib.inv())) {
  if (k.startsWith('cooked_')) {
    cookedFoods[k] = v;
  }
}

if (Object.keys(cookedFoods).length > 0) {
  console.log('Depositing cooked food into chest:', JSON.stringify(cookedFoods));
  await lib.deposit(cookedFoods, chestPos.x, chestPos.y, chestPos.z);
  bot.chat(`delta: Deposited ${JSON.stringify(cookedFoods)} in base chest for Beta!`);
} else {
  console.log('No cooked food to deposit');
  bot.chat('delta: Outside hunt complete, returning to base.');
}

// Check on teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}
