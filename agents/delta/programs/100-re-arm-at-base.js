// programs/100-re-arm-at-base.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

const chestPos = new Vec3(293, 72, -57);
const tablePos = new Vec3(295, 72, -56);
const tableBlock = bot.blockAt(tablePos);

// 1. Inspect furnaces
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
for (const f of furnaces) {
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    const outI = fw.outputItem();
    if (outI && outI.count > 0) {
      await fw.takeOutput();
      console.log(`Took ${outI.count} ${outI.name} from furnace!`);
    }
    await fw.close();
  } catch (e) {}
}

// 2. Inspect chest
let chest = {};
try {
  chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(chest));
} catch (e) {}

// Withdraw materials
const toWithdraw = {};
if (chest.iron_ingot) toWithdraw.iron_ingot = chest.iron_ingot;
if (chest.cobblestone) toWithdraw.cobblestone = Math.min(chest.cobblestone, 32);
if (chest.cobbled_deepslate) toWithdraw.cobbled_deepslate = Math.min(chest.cobbled_deepslate, 32);
if (chest.stick) toWithdraw.stick = Math.min(chest.stick, 8);
if (chest.coal) toWithdraw.coal = Math.min(chest.coal, 2);

console.log('Withdrawing:', JSON.stringify(toWithdraw));
try {
  await lib.withdraw(toWithdraw, chestPos.x, chestPos.y, chestPos.z);
} catch (e) {
  console.log('Withdraw note:', e.message);
}

console.log('Inventory after withdraw:', JSON.stringify(lib.inv()));

// 3. Craft stone tools & shield
if (tableBlock) {
  // Craft sticks from planks if needed
  if (lib.count('stick') < 4 && lib.count('*_planks') >= 2) {
    const rec = bot.recipesFor(mcData.itemsByName.stick.id, null, 1, tableBlock)[0];
    if (rec) await bot.craft(rec, 1, tableBlock);
  }

  // Craft stone_pickaxe
  if (!lib.count('stone_pickaxe') && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
    const sp = mcData.itemsByName.stone_pickaxe;
    const rec = bot.recipesFor(sp.id, null, 1, tableBlock)[0];
    if (rec) {
      await bot.craft(rec, 1, tableBlock);
      await sleep(200);
      await lib.stowCursor();
      console.log('Crafted stone_pickaxe!');
    }
  }

  // Craft stone_sword
  if (!lib.count('stone_sword') && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
    const ss = mcData.itemsByName.stone_sword;
    const rec = bot.recipesFor(ss.id, null, 1, tableBlock)[0];
    if (rec) {
      await bot.craft(rec, 1, tableBlock);
      await sleep(200);
      await lib.stowCursor();
      console.log('Crafted stone_sword!');
    }
  }

  // Craft shield if we have planks + iron_ingot
  if (!lib.count('shield') && lib.count('*_planks') >= 6 && lib.count('iron_ingot') >= 1) {
    const sh = mcData.itemsByName.shield;
    const rec = bot.recipesFor(sh.id, null, 1, tableBlock)[0];
    if (rec) {
      await bot.craft(rec, 1, tableBlock);
      await sleep(200);
      await lib.stowCursor();
      console.log('Crafted shield!');
    }
  }

  // Craft iron armor if ingots >= 4
  if (lib.count('iron_ingot') >= 4 && !lib.count('iron_boots')) {
    const ib = mcData.itemsByName.iron_boots;
    const rec = bot.recipesFor(ib.id, null, 1, tableBlock)[0];
    if (rec) {
      await bot.craft(rec, 1, tableBlock);
      await sleep(200);
      await lib.stowCursor();
      console.log('Crafted iron_boots!');
    }
  }
}

await lib.equipArmor();
await lib.equipWeapon();

console.log('Delta equipped:', JSON.stringify(lib.tools()));
console.log('Delta offhand:', bot.inventory.slots[45]?.name);
console.log('Delta inventory now:', JSON.stringify(lib.inv()));
bot.chat(`delta: Re-armed at base shelter! Tools: ${JSON.stringify(lib.tools())}. Health: ${bot.health}/20, Food: ${bot.food}/20.`);
