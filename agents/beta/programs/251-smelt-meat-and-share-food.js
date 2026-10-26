// programs/251-smelt-meat-and-share-food.js
console.log('=== Step 9: Inspect chest, load furnaces with meat & fuel, check wool ===');

// 1. Inspect chest
const chestPos = new Vec3(293, 72, -57);
const chestContents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chestContents));

// If chest has any wool or food, check
const woolTypes = ['white_wool', 'gray_wool', 'light_gray_wool', 'black_wool', 'brown_wool'];
for (const wt of woolTypes) {
  if (chestContents[wt]) {
    console.log(`Found ${chestContents[wt]} ${wt} in chest!`);
    await lib.withdraw({ [wt]: 'all' }, chestPos.x, chestPos.y, chestPos.z);
  }
}

// 2. Check if we can craft a bed now
for (const wt of woolTypes) {
  if (lib.count(wt) >= 3) {
    const bedName = wt.replace('_wool', '_bed');
    console.log(`We have 3 ${wt}! Crafting ${bedName}...`);
    try {
      await lib.craft(bedName, 1);
      console.log(`Crafted ${bedName}!`);
      // Spot for Bed 2: (293, 72, -56)
      const targetPos = new Vec3(293, 72, -56);
      console.log(`Placing ${bedName} at ${lib.fmt(targetPos)}...`);
      await lib.place(bedName, targetPos.x, targetPos.y, targetPos.z);
      console.log('Bed 2 placed successfully! MILESTONE 4 REACHED!');
      bot.chat('alpha: Bed 2 placed in base! Milestone 4 complete!');
    } catch (e) {
      console.log('Bed crafting/placing note:', e.message);
    }
    break;
  }
}

// 3. Inspect and load Furnaces at (295, 72, -55) and (295, 72, -57)
const f1Pos = new Vec3(295, 72, -55);
const f2Pos = new Vec3(295, 72, -57);

async function inspectFurnace(pos) {
  const blk = bot.blockAt(pos);
  if (!blk || !blk.name.includes('furnace')) return null;
  const f = await bot.openFurnace(blk);
  const info = {
    input: f.inputItem() ? `${f.inputItem().name} x${f.inputItem().count}` : null,
    fuel: f.fuelItem() ? `${f.fuelItem().name} x${f.fuelItem().count}` : null,
    output: f.outputItem() ? `${f.outputItem().name} x${f.outputItem().count}` : null
  };
  if (f.outputItem()) {
    await f.takeOutput();
  }
  return { f, info };
}

console.log('Inspecting furnaces...');
const f1 = await inspectFurnace(f1Pos);
if (f1) {
  console.log('Furnace 1:', f1.info);
  f1.f.close();
}

const f2 = await inspectFurnace(f2Pos);
if (f2) {
  console.log('Furnace 2:', f2.info);
  f2.f.close();
}

// Start smelting mutton in Furnace 1 if idle
if (lib.count('mutton') > 0 && lib.count('oak_planks') >= 4) {
  try {
    console.log('Smelting 8 mutton in furnace 1...');
    await lib.smelt('mutton', 'oak_planks', Math.min(8, lib.count('mutton')));
  } catch (e) {
    console.log('Smelt f1 note:', e.message);
  }
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`beta: At base. Cooked food: ${lib.count('cooked_*')}, raw meat: ${lib.count('beef') + lib.count('porkchop') + lib.count('chicken')}.`);
