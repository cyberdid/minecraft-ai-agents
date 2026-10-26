// programs/027-chest-and-smelt.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Smelt raw_iron in furnace at (295, 72, -55)
const fBlock = bot.blockAt(new Vec3(295, 72, -55));
if (fBlock && lib.count('raw_iron') > 0) {
  try {
    const f = await bot.openFurnace(fBlock);
    const raw = bot.inventory.items().find(i => i.name === 'raw_iron');
    if (raw) await f.putInput(raw.type, null, raw.count);
    if (!f.fuelItem() && lib.count('coal') > 0) {
      const coal = bot.inventory.items().find(i => i.name === 'coal');
      if (coal) await f.putFuel(coal.type, null, 1);
    }
    f.close();
    console.log('Started smelting raw_iron in base furnace!');
  } catch (e) {
    console.log('Base furnace error:', e.message);
  }
}

// 2. Deposit food and surplus blocks into base chest at (293, 72, -57)
console.log('Depositing food and materials into base chest...');
try {
  await lib.deposit({
    cooked_chicken: 1,
    diorite: 'all',
    cobblestone: 16,
    feather: 'all',
    egg: 'all'
  }, 293, 72, -57);
  console.log('Deposited successfully!');
} catch (e) {
  console.log('Deposit error:', e.message);
}

// 3. Inspect chest contents
const chest = await lib.chestContents(293, 72, -57);
console.log('Chest now has:', JSON.stringify(chest));

// 4. Ensure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// Chat update
bot.chat('gamma deposited 1 cooked_chicken in base chest for Beta! Iron smelting in furnace.');
console.log('Gamma inventory now:', JSON.stringify(lib.inv()));
console.log('Night in:', lib.time().secondsUntilNight);
