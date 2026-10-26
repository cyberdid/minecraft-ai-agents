// programs/080-base-rearm-and-team-sync.js
console.log('--- BASE RE-ARM & TEAM SYNC ---');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Team tactical alert
bot.chat('TEAM ALERT: Piglins shot Alpha and Gamma with crossbows! We MUST wear at least ONE piece of GOLD ARMOR (golden boots = 4 ingots) to make Piglins neutral. Let us smelt gold or craft boots before returning!');

// 2. Inspect base chest
const chest = await lib.chestContents(293, 72, -57);
console.log('Base chest contents:', JSON.stringify(chest));

// 3. Inspect furnaces
const furnaces = [new Vec3(295, 72, -55), new Vec3(295, 72, -54), new Vec3(295, 72, -57)];
for (const fp of furnaces) {
  const b = bot.blockAt(fp);
  if (b && (b.name === 'furnace' || b.name === 'lit_furnace')) {
    try {
      const f = await bot.openFurnace(b);
      console.log(`Furnace at ${lib.fmt(fp)}: in=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, out=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      if (f.outputItem()) {
        await f.takeOutput();
      }
      f.close();
    } catch (e) {}
  }
}

// 4. Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Player ${name} at: ${lib.fmt(p.entity.position)}, dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}`);
  }
}

// 5. Withdraw useful items from chest if available
const toTake = {};
if (chest.cobblestone) toTake.cobblestone = Math.min(chest.cobblestone, 20);
if (chest.granite) toTake.granite = Math.min(chest.granite, 64);
if (chest.andesite) toTake.andesite = Math.min(chest.andesite, 50);
if (chest.coal) toTake.coal = Math.min(chest.coal, 2);

if (Object.keys(toTake).length > 0) {
  console.log('Withdrawing:', JSON.stringify(toTake));
  await lib.withdraw(toTake, 293, 72, -57);
}

console.log('Gamma inventory now:', JSON.stringify(lib.inv()));
