// programs/649-craft-eyes-and-check-team.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 649: CRAFT EYES OF ENDER & ASSEMBLE TEAM ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Move to Base Chest / Crafting Table area (294, 72, -56)
try {
  await bot.pathfinder.goto(new goals.GoalNear(294, 72, -56, 1.2));
} catch (e) {}

// 2. Scan teammates
const teammates = Object.values(bot.entities).filter(e => e.type === 'player' && e !== bot.entity);
console.log(`Teammates inside base (${teammates.length}):`);
for (const tm of teammates) {
  console.log(`  - ${tm.username} at ${lib.fmt(tm.position)}, dist: ${bot.entity.position.distanceTo(tm.position).toFixed(1)}m`);
}

// 3. Inspect Base Chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);

let chestBlazePowder = 0;
let chestEnderPearls = 0;
let chestEyes = 0;

if (chestBlock && chestBlock.name.includes('chest')) {
  try {
    console.log('Opening Base Chest at (293, 72, -57)...');
    const chest = await bot.openChest(chestBlock);
    const cItems = chest.containerItems();
    console.log(`Base Chest holds ${cItems.length} stacks:`);
    for (const it of cItems) {
      console.log(`  * ${it.name} x${it.count}`);
      if (it.name === 'blaze_powder') chestBlazePowder += it.count;
      if (it.name === 'ender_pearl') chestEnderPearls += it.count;
      if (it.name === 'eye_of_ender') chestEyes += it.count;
    }

    // Check if food to eat
    const foodItem = cItems.find(i => ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton'].includes(i.name));
    if (foodItem && bot.food < 18) {
      await chest.withdraw(foodItem.type, null, Math.min(foodItem.count, 4));
    }

    // Check for iron armor
    for (const piece of ['iron_boots', 'iron_helmet', 'iron_chestplate', 'iron_leggings']) {
      const p = cItems.find(i => i.name === piece);
      if (p && lib.count(piece) === 0) {
        console.log(`Withdrawing ${piece} from chest...`);
        try { await chest.withdraw(p.type, null, 1); } catch (e) {}
      }
    }

    // Check if we can withdraw ingredients to craft eye_of_ender
    const bp = cItems.find(i => i.name === 'blaze_powder');
    const ep = cItems.find(i => i.name === 'ender_pearl');
    if (bp && ep) {
      const craftCount = Math.min(bp.count, ep.count);
      console.log(`Withdrawing ${craftCount} blaze_powder & ender_pearl to craft Eyes of Ender...`);
      await chest.withdraw(bp.type, null, craftCount);
      await chest.withdraw(ep.type, null, craftCount);
    }

    chest.close();
  } catch (ce) {
    console.log('Chest interaction error:', ce.message);
  }
}

// 4. Craft eye_of_ender if we hold ingredients
let invBP = lib.count('blaze_powder');
let invEP = lib.count('ender_pearl');
console.log(`Inventory ingredients: blaze_powder=${invBP}, ender_pearl=${invEP}`);

if (invBP > 0 && invEP > 0) {
  const craftN = Math.min(invBP, invEP);
  console.log(`Crafting ${craftN} eye_of_ender at Crafting Table...`);
  try {
    const table = bot.findBlock({ matching: b => b && b.name === 'crafting_table', maxDistance: 6 });
    if (table) {
      await lib.craft('eye_of_ender', craftN);
      console.log(`SUCCESS! Crafted ${craftN} Eyes of Ender! Total held: ${lib.count('eye_of_ender')}`);
      bot.chat(`gamma: CRAFTED ${lib.count('eye_of_ender')} EYES OF ENDER! Milestone 10 active!`);
    } else {
      console.log('Crafting table not found nearby!');
    }
  } catch (craftErr) {
    console.log('Craft eye_of_ender error:', craftErr.message);
  }
}

// 5. Equip best armor (prefer iron_boots over golden_boots in Overworld)
const ironBoots = bot.inventory.items().find(i => i.name === 'iron_boots');
if (ironBoots) {
  try { await bot.equip(ironBoots, 'feet'); } catch (e) {}
}
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Ensure shield in offhand
const sh = bot.inventory.items().find(i => i.name === 'shield');
if (sh && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(sh, 'off-hand'); } catch (e) {}
}

const totalEyes = lib.count('eye_of_ender') + chestEyes;
console.log(`=== END PROGRAM 649: Total Eyes of Ender: ${totalEyes} (Held: ${lib.count('eye_of_ender')}, Chest: ${chestEyes}) ===`);
bot.chat(`gamma: Status check — Eyes of Ender: ${totalEyes}, HP: ${bot.health}/20, Food: ${bot.food}/20.`);

return {
  eyesHeld: lib.count('eye_of_ender'),
  chestEyes,
  totalEyes,
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position,
  teammates: teammates.map(t => ({ name: t.username, pos: t.position })),
  inv: lib.inv()
};
