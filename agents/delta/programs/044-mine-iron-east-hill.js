// programs/044-mine-iron-east-hill.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time start:', JSON.stringify(lib.time()));

// 1. Withdraw spare stone pickaxe from chest
const chestPos = new Vec3(293, 72, -57);
try {
  await lib.withdraw({ stone_pickaxe: 1 }, chestPos.x, chestPos.y, chestPos.z);
  console.log('Withdrew spare stone pickaxe!');
} catch (e) {
  console.log('Withdraw note:', e.message);
}

// 2. Step outside base door
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

bot.chat('delta: Heading to East hill (350, 55, -35) to mine iron & coal with Alpha!');

// 3. Travel to East hill
console.log('Traveling to East hill at (350, 55, -35)...');
await lib.goToXZ(350, -35);
console.log('Arrived at East hill:', lib.fmt(bot.entity.position));

// 4. Scan for ores
const ironBlocks = bot.findBlocks({
  matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
  maxDistance: 32,
  count: 15
});
const coalBlocks = bot.findBlocks({
  matching: b => b.name === 'coal_ore' || b.name === 'deepslate_coal_ore',
  maxDistance: 32,
  count: 15
});
console.log(`Found ${ironBlocks.length} iron ore blocks, ${coalBlocks.length} coal ore blocks`);

// 5. Mine iron ore
for (const p of ironBlocks) {
  if (isCancelled() || lib.time().secondsUntilNight < 120) break;
  try {
    console.log(`Mining iron ore at ${lib.fmt(p)}...`);
    await lib.dig(p.x, p.y, p.z);
    await lib.pickup(4);
  } catch (err) {
    console.log('Dig iron error:', err.message);
  }
}

// 6. Mine coal ore if needed
if (lib.count('coal') < 8) {
  for (const p of coalBlocks) {
    if (isCancelled() || lib.time().secondsUntilNight < 120) break;
    try {
      console.log(`Mining coal ore at ${lib.fmt(p)}...`);
      await lib.dig(p.x, p.y, p.z);
      await lib.pickup(4);
    } catch (err) {
      console.log('Dig coal error:', err.message);
    }
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`delta: East hill mining update: holding ${lib.count('raw_iron')} raw_iron and ${lib.count('coal')} coal!`);
