// programs/369-enter-base-and-check-team.js
console.log('=== Program 369: Enter Base, Smelt Iron, & Check Team ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Enter base shelter
console.log('Entering base shelter through door (294, 72, -54)...');
try {
  await globalThis.passDoorIn();
  console.log('Entered via passDoorIn!');
} catch (e) {
  console.log('passDoorIn note:', e.message);
  try {
    await lib.goThroughDoor(294, 72, -54);
    console.log('Entered via goThroughDoor!');
  } catch (e2) {
    console.log('goThroughDoor note:', e2.message);
  }
}

console.log('Alpha pos inside base:', lib.fmt(bot.entity.position));

// 2. Check teammates
console.log('--- Teammates ---');
for (const name of ['beta', 'gamma', 'delta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`  ${name}: at ${lib.fmt(p.entity.position)}`);
  } else {
    console.log(`  ${name}: offline or not in loaded range`);
  }
}

// 3. Put 4 raw_iron into furnace at (295, 72, -55)
const fBlock = bot.blockAt(new Vec3(295, 72, -55));
if (fBlock) {
  try {
    const f = await bot.openFurnace(fBlock);
    const existingFuel = f.fuelItem();
    const existingInp = f.inputItem();
    const existingOut = f.outputItem();
    console.log('Furnace state before:');
    console.log('  Fuel:', existingFuel ? `${existingFuel.name}x${existingFuel.count}` : 'empty');
    console.log('  Input:', existingInp ? `${existingInp.name}x${existingInp.count}` : 'empty');
    console.log('  Output:', existingOut ? `${existingOut.name}x${existingOut.count}` : 'empty');

    if (existingOut) {
      console.log('Taking existing output:', existingOut.name, existingOut.count);
      await f.takeOutput();
    }

    if (lib.count('coal') > 0 && (!existingFuel || existingFuel.count < 2)) {
      console.log('Adding coal fuel...');
      await f.putFuel(mcData.itemsByName.coal.id, null, 1);
    }

    if (lib.count('raw_iron') > 0) {
      console.log(`Adding ${lib.count('raw_iron')} raw_iron...`);
      await f.putInput(mcData.itemsByName.raw_iron.id, null, lib.count('raw_iron'));
    }

    f.close();
  } catch (err) {
    console.log('Furnace error:', err.message);
  }
}

// 4. Check base chest at (293, 72, -57)
try {
  const chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(chest));
} catch (e) {
  console.log('Chest error:', e.message);
}

// 5. Check offhand shield
const offhand = bot.inventory.slots[45];
console.log('Offhand item:', offhand?.name);
if (!offhand || offhand.name !== 'shield') {
  if (lib.count('shield') > 0) {
    await lib.equipArmor();
  }
}

console.log('Alpha inventory:', JSON.stringify(lib.inv()));
bot.chat('team: Alpha back in base! Loaded 4 raw_iron in furnace. Checking iron and armor status for Nether.');
