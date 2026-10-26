// programs/264-collect-smelted-iron-and-craft-bed2.js
console.log('=== Step 22: Collect iron, craft shears, get wool, place Bed 2 ===');

// 1. Take smelted iron from F1
const f1Block = bot.blockAt(new Vec3(295, 72, -55));
if (f1Block) {
  const f1 = await bot.openFurnace(f1Block);
  if (f1.outputItem()) {
    console.log(`Taking ${f1.outputItem().count} ${f1.outputItem().name} from F1.`);
    await f1.takeOutput();
  }
  f1.close();
}

// Check F2
const f2Block = bot.blockAt(new Vec3(295, 72, -57));
if (f2Block) {
  const f2 = await bot.openFurnace(f2Block);
  if (f2.outputItem()) {
    console.log(`Taking ${f2.outputItem().count} ${f2.outputItem().name} from F2.`);
    await f2.takeOutput();
  }
  f2.close();
}

console.log(`Iron ingots on beta: ${lib.count('iron_ingot')}`);

// 2. Craft shears
if (lib.count('shears') === 0 && lib.count('iron_ingot') >= 2) {
  console.log('Crafting shears...');
  try {
    await lib.craft('shears', 1);
    console.log('Shears crafted successfully!');
  } catch (e) {
    console.log('Shears craft note:', e.message);
  }
}

// 3. Exit base to shear a sheep
console.log('Exiting base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  await lib.goTo(294, 72, -52, 1);
}

// Find sheep
let sheep = Object.values(bot.entities).find(e => 
  e && e.name === 'sheep' && e.position && e.position.distanceTo(bot.entity.position) < 48
);

if (!sheep) {
  console.log('Walking east towards (330, 72, -30) to locate sheep...');
  try {
    await lib.goToXZ(330, -30, { timeoutMs: 15000 });
    sheep = Object.values(bot.entities).find(e => 
      e && e.name === 'sheep' && e.position && e.position.distanceTo(bot.entity.position) < 48
    );
  } catch (e) {
    console.log('Locate sheep note:', e.message);
  }
}

if (sheep) {
  console.log('Found sheep at:', lib.fmt(sheep.position));
  try {
    if (lib.count('shears') > 0) {
      await bot.equip(mcData.itemsByName.shears.id, 'hand');
      await lib.goTo(sheep.position.x, sheep.position.y, sheep.position.z, 2);
      await bot.activateEntity(sheep);
      await sleep(500);
      await lib.pickup(6);
      console.log('Sheared sheep successfully!');
    } else {
      await lib.equipWeapon();
      bot.pvp.attack(sheep);
      const dl = Date.now() + 10000;
      while (bot.entities[sheep.id] && Date.now() < dl) await sleep(250);
      bot.pvp.stop();
      await lib.pickup(6);
    }
  } catch (e) {
    console.log('Shearing/hunting note:', e.message);
  }
}

// 4. Return to base
console.log('Returning to base at (294, 72, -54)...');
await lib.goTo(294, 72, -53, 1, { timeoutMs: 20000 });
try {
  await lib.goThroughDoor(294, 72, -54);
  console.log('Inside base!');
} catch (e) {}

// 5. Inspect chest and combine wool to craft Bed 2
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Base chest contents:', JSON.stringify(chest));

const woolTypes = ['gray_wool', 'light_gray_wool', 'white_wool', 'black_wool', 'brown_wool'];
let bedCrafted = false;

for (const wt of woolTypes) {
  const total = (chest[wt] || 0) + lib.count(wt);
  console.log(`Total ${wt} available: ${total}`);
  if (total >= 3) {
    if (chest[wt]) {
      console.log(`Withdrawing ${chest[wt]} ${wt} from chest...`);
      await lib.withdraw({ [wt]: chest[wt] }, chestPos.x, chestPos.y, chestPos.z);
    }
    const bedItem = wt.replace('_wool', '_bed');
    console.log(`Crafting ${bedItem}...`);
    try {
      await lib.craft(bedItem, 1);
      console.log(`Placing ${bedItem} at (293, 72, -56)...`);
      await lib.place(bedItem, 293, 72, -56);
      console.log(`Verified block at (293, 72, -56):`, lib.blockAt(293, 72, -56)?.name);
      bedCrafted = true;
      bot.chat(`alpha: Bed 2 (${bedItem}) placed at (293, 72, -56)! Milestone 4 complete!`);
      break;
    } catch (e) {
      console.log('Bed placement error:', e.message);
    }
  }
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Time left until night:', lib.time().secondsUntilNight);
