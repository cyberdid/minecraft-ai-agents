// programs/060-wood-sword-and-hunt.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Step out base door
const doorPos = new Vec3(294, 72, -54);
const door = bot.blockAt(doorPos);
if (door && !door.getProperties().open) {
  await bot.activateBlock(door);
  await sleep(200);
}
await lib.walkTo(294.5, -50);
if (door && bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
console.log('Outside base at:', lib.fmt(bot.entity.position));

// 2. Collect 3 logs near base
console.log('Collecting logs for sticks & tools...');
try {
  await lib.collect('*_log', 3);
  console.log('Logs collected! Inv:', JSON.stringify(lib.inv()));
} catch (e) {
  console.log('Collect log note:', e.message);
}

// 3. Craft planks, sticks, stone sword, stone axe
const log = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (log) {
  const plank = log.replace('_log', '_planks');
  await lib.craft(plank, 8);
  await lib.craft('stick', 8);
}

if (!lib.count('stone_sword')) {
  await lib.craft('stone_sword', 1);
}
if (!lib.count('stone_axe')) {
  await lib.craft('stone_axe', 1);
}

await lib.equipWeapon();
console.log('Equipped weapon:', JSON.stringify(lib.tools()));

// 4. Hunt cows / sheep for beef & mutton
const targets = ['cow', 'sheep', 'pig'];
let killed = 0;
for (const mob of targets) {
  if (isCancelled() || lib.time().secondsUntilNight < 180) break;
  try {
    console.log(`Hunting ${mob}...`);
    const r = await lib.hunt(mob, 2);
    console.log(`Hunt ${mob} result:`, JSON.stringify(r));
    killed += r.killed;
    if (killed >= 2) break;
  } catch (err) {
    console.log(`Hunt ${mob} note:`, err.message);
  }
}

// 5. Return inside base
console.log('Returning inside base...');
await lib.goTo(doorPos.x, doorPos.y, doorPos.z + 1, 1);
if (door && !bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
await lib.walkTo(294, -56);
if (door && bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 6. Smelt raw meat in the furnace (furnace at (295, 72, -55) already has coal!)
const rawKeys = ['beef', 'raw_beef', 'mutton', 'raw_mutton', 'porkchop', 'raw_porkchop', 'chicken', 'raw_chicken'];
for (const raw of rawKeys) {
  const count = lib.inv()[raw];
  if (count > 0) {
    console.log(`Smelting ${count} of ${raw}...`);
    try {
      await lib.smelt(raw, 'coal', count);
    } catch (e) {
      console.log('Smelt note:', e.message);
    }
  }
}

// 7. Eat cooked meat to heal
try {
  await lib.eat();
  console.log(`Ate cooked meat! Food: ${bot.food}/20, Health: ${bot.health}/20`);
} catch (e) {
  console.log('Eat note:', e.message);
}

// 8. Deposit surplus cooked food into chest for Alpha
const chestPos = new Vec3(293, 72, -57);
const cookedToDeposit = {};
for (const [k, v] of Object.entries(lib.inv())) {
  if (k.startsWith('cooked_') && v > 1) {
    cookedToDeposit[k] = v - 1; // keep 1 for delta
  }
}
if (Object.keys(cookedToDeposit).length > 0) {
  await lib.deposit(cookedToDeposit, chestPos.x, chestPos.y, chestPos.z);
  console.log('Deposited food for Alpha:', JSON.stringify(cookedToDeposit));
  bot.chat(`delta: Cooked food deposited in chest for Alpha: ${JSON.stringify(cookedToDeposit)}!`);
}

bot.chat(`delta: Hunt and cook complete! Delta health: ${bot.health}/20, food: ${bot.food}/20.`);
