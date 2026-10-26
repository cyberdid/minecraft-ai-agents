// programs/211-emergency-hunt-and-feed-team.js
console.log('Delta pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Scan for animals within 64m
const animals = [];
for (const id in bot.entities) {
  const e = bot.entities[id];
  if (e && ['cow', 'pig', 'sheep', 'chicken'].includes(e.name)) {
    animals.push({ name: e.name, pos: e.position, dist: bot.entity.position.distanceTo(e.position) });
  }
}
animals.sort((a, b) => a.dist - b.dist);
console.log(`Found ${animals.length} animals nearby:`, animals.map(a => `${a.name} at dist ${a.dist.toFixed(1)}m`).join(', '));

// 2. Ensure we have a weapon: get 1 log if needed
if (lib.count('stone_sword') === 0 && lib.count('wooden_sword') === 0) {
  if (lib.count('*_planks') < 5) {
    console.log('Harvesting 1 reachable log for planks...');
    const logs = bot.findBlocks({
      matching: b => b.name.includes('log'),
      maxDistance: 16,
      count: 5
    });
    for (const logPos of logs) {
      if (Math.abs(logPos.y - bot.entity.position.y) <= 2) {
        console.log('Digging log at', lib.fmt(logPos));
        try {
          await lib.dig(logPos.x, logPos.y, logPos.z);
          await lib.pickup(4);
          break;
        } catch (e) {}
      }
    }
  }

  // Craft planks and wooden pickaxe
  if (lib.count('birch_log') > 0) await lib.craft('birch_planks', lib.count('birch_log') * 4).catch(() => {});
  if (lib.count('oak_log') > 0) await lib.craft('oak_planks', lib.count('oak_log') * 4).catch(() => {});
  
  if (lib.count('wooden_pickaxe') === 0 && lib.count('*_planks') >= 3) {
    if (lib.count('stick') < 2) await lib.craft('stick', 4).catch(() => {});
    await lib.craft('wooden_pickaxe', 1).catch(() => {});
  }

  // Mine 6 stone
  if (lib.count('wooden_pickaxe') > 0 && lib.count('cobblestone') < 5) {
    console.log('Mining 5 stone...');
    await lib.collect('stone', 5).catch(() => {});
  }

  // Craft stone sword
  if (lib.count('cobblestone') >= 2) {
    await lib.craft('stone_sword', 1).catch(() => {});
    console.log('Crafted stone sword!');
  }
}

// 3. Hunt 3 animals for meat
console.log('Hunting animals for food...');
bot.chat('delta: Hunting food for Alpha & Gamma! Securing meat now...');
for (const animal of ['cow', 'pig', 'sheep']) {
  if (isCancelled()) break;
  try {
    const gained = await lib.hunt(animal, 2);
    console.log(`Hunted ${animal}:`, JSON.stringify(gained));
  } catch (e) {
    console.log(`Hunt notice for ${animal}:`, e.message);
  }
}

// 4. Return to base shelter
const doorPos = new Vec3(294, 73, -54);
console.log('Returning to base shelter to cook food...');
try {
  await lib.goThroughDoor(doorPos.x, doorPos.y, doorPos.z);
} catch (e) {
  await lib.goTo(293, 72, -55, 1);
}

// 5. Smelt all raw meat in base furnace
const rawMeats = ['raw_beef', 'raw_porkchop', 'raw_mutton', 'raw_chicken'];
for (const meat of rawMeats) {
  const count = lib.count(meat);
  if (count > 0) {
    console.log(`Smelting ${count} ${meat}...`);
    try {
      await lib.smelt(meat, 'oak_planks', count);
      console.log(`Smelted ${meat}!`);
    } catch (e) {
      console.log(`Smelt notice for ${meat}:`, e.message);
    }
  }
}

// 6. Deposit all cooked food in chest for Alpha and Gamma!
const cookedMeats = ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken'];
let totalDeposited = 0;
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    for (const cooked of cookedMeats) {
      const item = lib.bot().inventory.items().find(i => i.name === cooked);
      if (item && item.count > 0) {
        await chest.deposit(item.type, null, item.count);
        totalDeposited += item.count;
        console.log(`Deposited ${item.count} ${cooked} into chest!`);
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest deposit error:', e.message);
  }
}

console.log('Total food deposited for team:', totalDeposited);
if (totalDeposited > 0) {
  bot.chat(`delta: EMERGENCY FOOD READY! Deposited ${totalDeposited} cooked meat into base chest (293, 72, -57) for Alpha & Gamma! Eat now!`);
}

console.log('Final pos:', lib.fmt(bot.entity.position));
console.log('Final inventory:', JSON.stringify(lib.inv()));
