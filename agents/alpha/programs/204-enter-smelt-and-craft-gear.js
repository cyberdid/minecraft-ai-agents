// programs/204-enter-smelt-and-craft-gear.js
console.log('--- Night Protocol: Enter Base, Smelt All Iron, and Craft Tools ---');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Night in:', lib.time().secondsUntilNight);

// 1. Pass inside base through door
if (bot.entity.position.distanceTo(new Vec3(294, 72, -54)) < 6) {
  try {
    if (typeof passDoorIn === 'function') await passDoorIn();
    else await lib.goThroughDoor(294, 72, -54);
    console.log('Inside base! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Door passage error:', e.message);
  }
}

// 2. Load the remaining 6 raw iron and coal into furnaces (295, 72, -54) and (295, 72, -56)
const furns = [new Vec3(295, 72, -54), new Vec3(295, 72, -56), new Vec3(295, 72, -55)];
for (const fpos of furns) {
  const b = bot.blockAt(fpos);
  if (b && b.name === 'furnace') {
    try {
      const furn = await bot.openFurnace(b);
      // Collect any finished output
      if (furn.outputItem()) {
        console.log(`Taking output from furnace at ${lib.fmt(fpos)}: ${furn.outputItem().name} x${furn.outputItem().count}`);
        await furn.takeOutput();
      }
      // Add fuel if needed
      if (!furn.fuelItem() && lib.count('coal') > 0) {
        await furn.putFuel(mcData.itemsByName.coal.id, null, 1);
      }
      // Add input raw iron
      if (!furn.inputItem() && lib.count('raw_iron') > 0) {
        const toPut = Math.min(lib.count('raw_iron'), 3);
        await furn.putInput(mcData.itemsByName.raw_iron.id, null, toPut);
        console.log(`Loaded ${toPut} raw iron into furnace at ${lib.fmt(fpos)}`);
      }
      furn.close();
    } catch (e) {
      console.log(`Furnace error at ${lib.fmt(fpos)}:`, e.message);
    }
  }
}

// 3. Inspect base chest
const chestPos = new Vec3(293, 72, -57);
let chest = {};
try {
  chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(chest));
} catch (e) {}

// 4. Check if gravel can give flint for flint_and_steel
if (lib.count('flint') === 0 && (chest.gravel || lib.count('gravel') > 0)) {
  console.log('Found gravel in chest, checking for flint...');
  // Check if flint is in chest
  if (chest.flint && chest.flint > 0) {
    await lib.withdraw({ flint: 1 }, chestPos.x, chestPos.y, chestPos.z);
  }
}

// 5. Check Beta
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p) {
    console.log(`Beta pos: ${p.entity ? lib.fmt(p.entity.position) : 'unknown'}, held: ${p.entity?.heldItem?.name}`);
  }
}

bot.chat(`beta: Safe inside base. Smelting 10 iron across all 3 furnaces. Total iron ingots in my inv: ${lib.count('iron_ingot')}.`);

// 6. Wait for smelting and night sleep
const startWait = Date.now();
while (!isCancelled() && (Date.now() - startWait < 30000)) {
  // Check if furnaces have smelted iron ingots
  for (const fpos of furns) {
    const b = bot.blockAt(fpos);
    if (b && b.name === 'furnace') {
      try {
        const furn = await bot.openFurnace(b);
        if (furn.outputItem()) await furn.takeOutput();
        furn.close();
      } catch (e) {}
    }
  }

  // Attempt to sleep if canSleep is true
  if (lib.time().canSleep) {
    console.log('Night is here! Attempting to sleep...');
    try {
      await lib.sleepInBed();
      console.log('Woke up! Night skipped.');
      break;
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
  }

  await sleep(3000);
}

// 7. Craft priorities with smelted iron:
// - Bucket (3 iron ingots)
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0 && lib.count('water_bucket') === 0) {
  console.log('Crafting bucket (3 iron ingots)...');
  try {
    await lib.craft('bucket', 1);
    console.log('Bucket crafted!');
    bot.chat('beta: Crafted bucket!');
  } catch (e) {
    console.log('Craft bucket error:', e.message);
  }
}

// - Iron pickaxe for Beta (3 iron ingots)
if (lib.count('iron_ingot') >= 3 && lib.count('iron_pickaxe') < 2) {
  console.log('Crafting 2nd iron_pickaxe for Beta...');
  try {
    if (lib.count('stick') < 2) {
      if (lib.count('*_planks') < 1 && lib.count('*_log') > 0) {
        const log = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
        await lib.craft(log.replace('_log', '_planks'), 4);
      }
      const plank = Object.keys(lib.inv()).find(k => k.endsWith('_planks')) || 'birch_planks';
      await lib.craft('stick', 4);
    }
    await lib.craft('iron_pickaxe', 1);
    console.log('2nd Iron pickaxe crafted for Beta!');
    // Place in base chest for Beta
    await lib.deposit({ iron_pickaxe: 1 }, chestPos.x, chestPos.y, chestPos.z);
    bot.chat('beta: Placed iron_pickaxe in base chest for you!');
  } catch (e) {
    console.log('Craft iron_pickaxe error:', e.message);
  }
}

// - Shield for Beta if needed
if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting shield for Beta...');
  try {
    await lib.craft('shield', 1);
    await lib.deposit({ shield: 1 }, chestPos.x, chestPos.y, chestPos.z);
    bot.chat('beta: Placed shield in base chest for you!');
  } catch (e) {}
}

console.log('Finished 204. Final status:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food, 'Iron ingots:', lib.count('iron_ingot'), 'Raw iron:', lib.count('raw_iron'), 'Time:', JSON.stringify(lib.time()));
