// programs/083-east-hill-iron-expedition.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Withdraw 12 cobblestone and 6 sticks from chest to craft 2 spare stone pickaxes
const chestPos = new Vec3(293, 72, -57);
const tablePos = new Vec3(295, 72, -56);
const tableBlock = bot.blockAt(tablePos);

try {
  await lib.withdraw({ cobblestone: 12, stick: 6 }, chestPos.x, chestPos.y, chestPos.z);
  console.log('Withdrew cobble & sticks');
} catch (e) {
  console.log('Withdraw note:', e.message);
}

// Craft stone pickaxes until we have 3
if (tableBlock) {
  const spItem = mcData.itemsByName.stone_pickaxe;
  while (lib.count('stone_pickaxe') < 3 && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
    const rec = bot.recipesFor(spItem.id, null, 1, tableBlock)[0];
    if (rec) {
      await bot.craft(rec, 1, tableBlock);
      await sleep(200);
      await lib.stowCursor();
      console.log('Crafted stone_pickaxe! Total now:', lib.count('stone_pickaxe'));
    } else {
      break;
    }
  }
}

console.log('Pickaxes ready:', lib.count('stone_pickaxe'));
console.log('Delta inventory before leaving:', JSON.stringify(lib.inv()));

// 2. Step outside base door
const doorPos = new Vec3(294, 72, -54);
const door = bot.blockAt(doorPos);
if (door && door.name.includes('door')) {
  await bot.activateBlock(door);
  await sleep(300);
  await lib.walkTo(294, -52);
  await sleep(300);
  await bot.activateBlock(bot.blockAt(doorPos));
} else {
  await lib.goTo(294, 72, -52);
}
console.log('Outside base at:', lib.fmt(bot.entity.position));

bot.chat('delta: Heading to East hill (360, 65, -35) to quarry iron ore for armor!');

// 3. Follow staged waypoints to East hill
const waypoints = [
  new Vec3(310, 72, -46),
  new Vec3(335, 70, -40),
  new Vec3(360, 65, -35)
];

for (const wp of waypoints) {
  console.log(`Walking to waypoint ${lib.fmt(wp)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2));
  } catch (err) {
    console.log(`Waypoint ${lib.fmt(wp)} err:`, err.message);
  }
}

console.log('Arrived at East hill:', lib.fmt(bot.entity.position));

// 4. Scan for iron_ore, deepslate_iron_ore, coal_ore
const ores = bot.findBlocks({
  matching: b => ['iron_ore', 'deepslate_iron_ore', 'coal_ore'].includes(b.name),
  maxDistance: 32,
  count: 30
});
console.log(`Found ${ores.length} ore blocks on East hill!`);
for (const p of ores.slice(0, 8)) {
  console.log(`- ${bot.blockAt(p).name} at ${lib.fmt(p)} (dist ${Math.round(bot.entity.position.distanceTo(p))})`);
}

// 5. Mine iron ores safely
let mined = 0;
for (const p of ores) {
  const block = bot.blockAt(p);
  if (!block || !block.name.includes('iron')) continue;
  if (lib.time().secondsUntilNight < 120 || isCancelled()) {
    console.log('Night approaching (<120s), stopping mining!');
    break;
  }
  console.log(`Mining ${block.name} at ${lib.fmt(p)}...`);
  try {
    await lib.dig(p.x, p.y, p.z);
    await lib.pickup(4);
    mined++;
    console.log(`Mined ${mined} iron ore! Raw iron count: ${lib.count('raw_iron')}`);
  } catch (e) {
    console.log(`Dig error at ${lib.fmt(p)}:`, e.message);
  }
  if (lib.count('raw_iron') >= 12) {
    console.log('Reached 12 raw iron target!');
    break;
  }
}

console.log('Mining complete. Raw iron in inv:', lib.count('raw_iron'));

// 6. Return to base via waypoints
console.log('Returning to base via staged waypoints...');
const returnWps = [
  new Vec3(335, 70, -40),
  new Vec3(310, 72, -46),
  new Vec3(294, 72, -52)
];

for (const rwp of returnWps) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(rwp.x, rwp.y, rwp.z, 2));
  } catch (e) {}
}

// Enter base door
const doorRet = bot.blockAt(doorPos);
if (doorRet && doorRet.name.includes('door')) {
  await bot.activateBlock(doorRet);
  await sleep(300);
  await lib.walkTo(294, -56);
  await sleep(300);
  await bot.activateBlock(bot.blockAt(doorPos));
} else {
  await lib.goTo(294, 72, -56);
}

console.log('Safely inside base at:', lib.fmt(bot.entity.position));
console.log('Final inventory:', JSON.stringify(lib.inv()));
bot.chat(`delta: Back in base! raw_iron: ${lib.count('raw_iron')}. Smelting for Milestone 3!`);
