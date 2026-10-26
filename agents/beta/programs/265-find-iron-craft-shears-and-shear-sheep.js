// programs/265-find-iron-craft-shears-and-shear-sheep.js
console.log('=== Step 23: Locate iron ingots, craft shears, get Bed 2 wool ===');

// 1. Tidy cursor and check furnaces
await lib.stowCursor();
await lib.clearCraftingGrid();

const f1Block = bot.blockAt(new Vec3(295, 72, -55));
if (f1Block) {
  const f1 = await bot.openFurnace(f1Block);
  console.log('F1 items:', {
    input: f1.inputItem() ? `${f1.inputItem().name} x${f1.inputItem().count}` : null,
    fuel: f1.fuelItem() ? `${f1.fuelItem().name} x${f1.fuelItem().count}` : null,
    output: f1.outputItem() ? `${f1.outputItem().name} x${f1.outputItem().count}` : null
  });
  if (f1.outputItem()) await f1.takeOutput();
  f1.close();
}

console.log('Beta inventory after stowing cursor:', JSON.stringify(lib.inv()));

// 2. Craft shears
if (lib.count('shears') === 0 && lib.count('iron_ingot') >= 2) {
  console.log('Crafting shears...');
  try {
    await lib.craft('shears', 1);
    console.log('Shears crafted! Count:', lib.count('shears'));
  } catch (e) {
    console.log('Shears craft error:', e.message);
  }
}

// 3. Exit base and find a sheep
console.log('Exiting base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}

// Search directions: North (towards z=12) and East (towards x=360)
const searchPoints = [
  { x: 305, z: 12 },
  { x: 350, z: -20 },
  { x: 400, z: 20 }
];

let targetSheep = null;

for (const pt of searchPoints) {
  if (isCancelled() || lib.time().secondsUntilNight < 120) break;
  // Check visible sheep
  targetSheep = Object.values(bot.entities).find(e => 
    e && e.name === 'sheep' && e.position && e.position.distanceTo(bot.entity.position) < 48
  );
  if (targetSheep) break;

  console.log(`Walking towards (${pt.x}, ${pt.z}) to find sheep...`);
  try {
    await lib.goToXZ(pt.x, pt.z, { timeoutMs: 25000 });
  } catch (e) {
    console.log('goToXZ note:', e.message);
  }

  targetSheep = Object.values(bot.entities).find(e => 
    e && e.name === 'sheep' && e.position && e.position.distanceTo(bot.entity.position) < 48
  );
  if (targetSheep) break;
}

if (targetSheep) {
  console.log(`Found sheep at ${lib.fmt(targetSheep.position)}!`);
  try {
    if (lib.count('shears') > 0) {
      console.log('Shearing sheep...');
      await bot.equip(mcData.itemsByName.shears.id, 'hand');
      await lib.goTo(targetSheep.position.x, targetSheep.position.y, targetSheep.position.z, 2, { timeoutMs: 15000 });
      await bot.activateEntity(targetSheep);
      await sleep(600);
      await lib.pickup(8);
      console.log('Sheared sheep! Wool on beta:', JSON.stringify(Object.fromEntries(Object.entries(lib.inv()).filter(([k]) => k.includes('wool')))));
    } else {
      console.log('Hunting sheep with weapon...');
      await lib.equipWeapon();
      bot.pvp.attack(targetSheep);
      const dl = Date.now() + 15000;
      while (bot.entities[targetSheep.id] && Date.now() < dl) await sleep(250);
      bot.pvp.stop();
      await lib.pickup(8);
    }
  } catch (e) {
    console.log('Action on sheep error:', e.message);
  }
}

// 4. Return to base
console.log('Returning to base at (294, 72, -54)...');
try {
  await lib.goToXZ(294, -54, { timeoutMs: 35000 });
  await lib.goTo(294, 72, -53, 1, { timeoutMs: 15000 });
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base safely!');
} catch (e) {
  console.log('Return note:', e.message);
}

// 5. Check if we can craft Bed 2 now
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Base chest contents:', JSON.stringify(chest));

const woolColors = ['gray', 'light_gray', 'white', 'black', 'brown'];
for (const c of woolColors) {
  const wn = `${c}_wool`;
  const total = (chest[wn] || 0) + lib.count(wn);
  console.log(`Total ${wn}: ${total}`);
  if (total >= 3) {
    if (chest[wn]) {
      await lib.withdraw({ [wn]: chest[wn] }, chestPos.x, chestPos.y, chestPos.z);
    }
    const bn = `${c}_bed`;
    console.log(`Crafting ${bn}...`);
    try {
      await lib.craft(bn, 1);
      console.log(`Placing ${bn} at (293, 72, -56)...`);
      await lib.place(bn, 293, 72, -56);
      console.log(`Bed 2 placed! Verified block: ${lib.blockAt(293, 72, -56)?.name}`);
      bot.chat(`alpha: Bed 2 (${bn}) placed at (293, 72, -56)! Milestone 4 complete!`);
    } catch (e) {
      console.log('Bed placement error:', e.message);
    }
    break;
  }
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Time left until night:', lib.time().secondsUntilNight);
bot.chat(`beta: Returned to base. Bed 2 status: ${lib.blockAt(293, 72, -56)?.name}. Night in ${lib.time().secondsUntilNight}s.`);
