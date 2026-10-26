// programs/089-prep-and-enter-nether.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dimension:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

const chestPos = new Vec3(293, 72, -57);
const doorPos = new Vec3(294, 72, -54);

// 1. Check chest and withdraw bow, arrows, and building blocks
try {
  const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(chest));

  const toWithdraw = {};
  if (chest.bow && !lib.count('bow')) toWithdraw.bow = 1;
  if (chest.arrow) toWithdraw.arrow = chest.arrow;
  if (chest.cobblestone && lib.count('cobblestone') < 32) {
    toWithdraw.cobblestone = Math.min(chest.cobblestone, 32);
  } else if (chest.cobbled_deepslate && lib.count('cobbled_deepslate') < 32) {
    toWithdraw.cobbled_deepslate = Math.min(chest.cobbled_deepslate, 32);
  }

  // Check food
  for (const f of ['cooked_beef', 'cooked_chicken', 'cooked_porkchop', 'bread', 'apple']) {
    if (chest[f] && bot.food < 18) {
      toWithdraw[f] = Math.min(chest[f], 2);
      break;
    }
  }

  if (Object.keys(toWithdraw).length > 0) {
    console.log('Withdrawing:', JSON.stringify(toWithdraw));
    await lib.withdraw(toWithdraw, chestPos.x, chestPos.y, chestPos.z);
  }
} catch (e) {
  console.log('Chest withdrawal note:', e.message);
}

// Eat if we have food
for (const f of ['cooked_beef', 'cooked_chicken', 'cooked_porkchop', 'bread', 'apple']) {
  while (lib.count(f) > 0 && bot.food < 20) {
    await lib.eat();
    await sleep(300);
    console.log(`Ate ${f}, food now: ${bot.food}`);
  }
}

await lib.equipArmor();
await lib.equipWeapon();
console.log('Delta equipped:', JSON.stringify(lib.tools()));
console.log('Offhand:', bot.inventory.slots[45]?.name);
console.log('Delta inventory:', JSON.stringify(lib.inv()));

// 2. Exit base through door
const door = bot.blockAt(doorPos);
if (door && door.name.includes('door')) {
  console.log('Opening base door...');
  await bot.activateBlock(door);
  await sleep(300);
  await lib.walkTo(294, -52);
  await sleep(300);
  await bot.activateBlock(bot.blockAt(doorPos));
  console.log('Closed base door.');
} else {
  await lib.goTo(294, 72, -52);
}

console.log('Outside base at:', lib.fmt(bot.entity.position));

// 3. Find Nether portal at (298, 72, -54)
const portals = bot.findBlocks({ matching: b => b.name === 'nether_portal', maxDistance: 16, count: 5 });
console.log(`Found ${portals.length} nether_portal blocks`);

if (portals.length > 0) {
  const p = portals[0];
  console.log(`Stepping into nether_portal at ${lib.fmt(p)}...`);
  bot.chat('delta: Stepping through Nether portal! Assembling bunker in the Nether.');
  await bot.pathfinder.goto(new goals.GoalBlock(p.x, p.y, p.z));
  console.log('Inside portal frame, waiting for teleport to Nether...');
  
  // Wait up to 12s for dimensional change
  const startDim = bot.game.dimension;
  for (let s = 0; s < 12; s++) {
    await sleep(1000);
    if (bot.game.dimension !== startDim) {
      console.log(`Dimension changed to ${bot.game.dimension}!`);
      break;
    }
  }
} else {
  console.log('No nether_portal blocks found within 16 blocks!');
}

console.log('Current pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

// 4. If in Nether, inspect immediate area
if (bot.game.dimension.includes('nether')) {
  console.log('Successfully arrived in the Nether!');
  bot.chat(`delta: Arrived in the Nether at ${lib.fmt(bot.entity.position)}!`);
  
  // Check nearby blocks & entities
  const hostiles = lib.hostiles(16);
  console.log(`Hostiles nearby:`, JSON.stringify(hostiles));

  // Check players in the Nether
  for (const [name, player] of Object.entries(bot.players)) {
    if (player && player.entity) {
      console.log(`Player ${name} in Nether at ${lib.fmt(player.entity.position)}`);
    }
  }
}
