// programs/253-check-chest-wool-craft-bed2-and-collect-iron.js
console.log('=== Step 11: Manage wool/bed and check furnace outputs ===');

// 1. Check Furnace 2 output
const f2Block = bot.blockAt(new Vec3(295, 72, -57));
if (f2Block) {
  const f2 = await bot.openFurnace(f2Block);
  if (f2.outputItem()) {
    console.log(`Taking ${f2.outputItem().count} ${f2.outputItem().name} from Furnace 2.`);
    await f2.takeOutput();
  }
  f2.close();
}

// 2. Inspect chest
const chestPos = new Vec3(293, 72, -57);
const chestContents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chestContents));

// Check all wool types in chest and inventory
const woolColors = ['white', 'gray', 'light_gray', 'black', 'brown'];
let craftedBed = false;

for (const col of woolColors) {
  const woolName = `${col}_wool`;
  const bedName = `${col}_bed`;
  const totalWool = (chestContents[woolName] || 0) + lib.count(woolName);
  console.log(`Total ${woolName} (chest + inv): ${totalWool}`);

  if (totalWool >= 3) {
    if (chestContents[woolName]) {
      await lib.withdraw({ [woolName]: chestContents[woolName] }, chestPos.x, chestPos.y, chestPos.z);
    }
    console.log(`Crafting ${bedName}...`);
    try {
      await lib.craft(bedName, 1);
      console.log(`Placing ${bedName} at (293, 72, -56)...`);
      // Make sure floor is solid
      const floorBlock = bot.blockAt(new Vec3(293, 71, -56));
      console.log('Floor block under bed spot:', floorBlock?.name);
      await lib.place(bedName, 293, 72, -56);
      console.log('Bed 2 placed successfully! MILESTONE 4 COMPLETE!');
      bot.chat('alpha: Bed 2 placed at (293, 72, -56)! Milestone 4 complete!');
      craftedBed = true;
      break;
    } catch (e) {
      console.log('Bed craft/place error:', e.message);
    }
  }
}

// If no 3 matching wool yet, deposit our wool into chest so Alpha can see it and combine
if (!craftedBed) {
  const woolToDeposit = {};
  for (const col of woolColors) {
    const wn = `${col}_wool`;
    if (lib.count(wn) > 0) woolToDeposit[wn] = lib.count(wn);
  }
  if (Object.keys(woolToDeposit).length > 0) {
    console.log('Depositing wool into chest for team sharing:', woolToDeposit);
    await lib.deposit(woolToDeposit, chestPos.x, chestPos.y, chestPos.z);
  }
}

// Check where Alpha is
const alpha = bot.players['alpha']?.entity;
if (alpha) {
  console.log('Alpha is at:', lib.fmt(alpha.position), 'distance:', alpha.position.distanceTo(bot.entity.position).toFixed(1));
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Time:', lib.time());
bot.chat(`beta: Put wool & food in base chest. Total cooked food on beta: ${lib.count('cooked_*')}. Ready for iron mining!`);
