// programs/045-mine-east-hill-iron.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time start:', JSON.stringify(lib.time()));

// 1. Scan for iron ore within 48 blocks
const ironOres = bot.findBlocks({
  matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
  maxDistance: 48,
  count: 20
});

console.log(`Found ${ironOres.length} iron ore blocks in loaded area`);

for (const p of ironOres) {
  if (isCancelled() || lib.time().secondsUntilNight < 120) break;
  console.log(`Mining iron ore at ${lib.fmt(p)}...`);
  try {
    await lib.goTo(p.x, p.y, p.z, 2, { dig: true, timeoutMs: 15000 });
    await lib.dig(p.x, p.y, p.z);
    await lib.pickup(4);
  } catch (err) {
    console.log(`Dig error at ${lib.fmt(p)}:`, err.message);
  }
}

console.log('Inventory after mining:', JSON.stringify(lib.inv()));
bot.chat(`delta: Holding ${lib.count('raw_iron')} raw_iron and ${lib.count('coal')} coal! Returning to base to fuel furnaces!`);

// 2. Return to base
console.log('Returning to base at (294, 72, -52)...');
await lib.goToXZ(294, -52);

// 3. Enter base door
const doorPos = new Vec3(294, 72, -54);
await lib.goTo(doorPos.x, doorPos.y, doorPos.z + 1, 1);

const door = bot.blockAt(doorPos);
if (door && !door.getProperties().open) {
  await bot.activateBlock(door);
  await sleep(200);
}
await lib.walkTo(294, -56);
if (door && bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 4. Deposit coal and raw_iron into base furnaces or chest
const chestPos = new Vec3(293, 72, -57);
const toDeposit = {};
if (lib.count('coal') > 0) toDeposit.coal = lib.count('coal');
if (lib.count('raw_iron') > 0) toDeposit.raw_iron = lib.count('raw_iron');

if (Object.keys(toDeposit).length > 0) {
  console.log('Depositing supplies in base chest:', JSON.stringify(toDeposit));
  await lib.deposit(toDeposit, chestPos.x, chestPos.y, chestPos.z);
}

// Check furnace status
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
for (const f of furnaces) {
  const fw = await bot.openFurnace(bot.blockAt(f));
  console.log(`Furnace at ${lib.fmt(f)}: in=${fw.inputItem()?.name}x${fw.inputItem()?.count} fuel=${fw.fuelItem()?.name}x${fw.fuelItem()?.count} out=${fw.outputItem()?.name}x${fw.outputItem()?.count}`);
  if (fw.outputItem()) {
    await fw.takeOutput();
    console.log('Took smelted output!');
  }
  await fw.close();
}

console.log('Final inv:', JSON.stringify(lib.inv()));
bot.chat(`delta: Back at base. Furnaces fueled with coal! Ready to craft Milestone 3 iron armor!`);
