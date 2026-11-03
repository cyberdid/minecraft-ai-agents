// programs/532-smelt-iron-and-hunt.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: SMELT IRON, HUNT FOOD & CRAFT SHIELD ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}, Food: ${bot.food}`);

// Step 1: Step inside base and take raw_iron from chest
await lib.goTo(293, 72, -56, 1);
const cBlock = bot.blockAt(new Vec3(293, 72, -57));
if (cBlock && cBlock.name.includes('chest')) {
  const chest = await bot.openChest(cBlock);
  const rawIron = chest.containerItems().find(i => i.name === 'raw_iron');
  if (rawIron) {
    console.log(`Taking raw_iron x${rawIron.count} from chest...`);
    await chest.withdraw(rawIron.type, null, rawIron.count);
  }
  chest.close();
}

// Step 2: Smelt raw_iron in furnace (295, 72, -55) using coal
if (lib.count('raw_iron') > 0 && lib.count('coal') > 0) {
  const fb = bot.blockAt(new Vec3(295, 72, -55));
  if (fb) {
    console.log('Smelting raw_iron in base furnace...');
    try {
      const furnace = await bot.openFurnace(fb);
      await furnace.putInput(mcData.itemsByName.raw_iron.id, null, 1);
      await furnace.putFuel(mcData.itemsByName.coal.id, null, 1);
      furnace.close();
    } catch (e) {
      console.log('Furnace load error:', e.message);
    }
  }
}

// Step 3: Get wood logs for planks (need 6 planks total for shield)
if (lib.count('*_planks') < 6) {
  console.log('Gathering oak log for shield planks...');
  try {
    await lib.collect('oak_log', 1);
    await lib.craft('oak_planks', 4);
  } catch (e) {
    console.log('Wood gather notice:', e.message);
  }
}

// Step 4: Hunt nearby animals for meat while iron smelts
console.log(`Food: ${bot.food}/20. Hunting animals near base...`);
const animals = ['cow', 'pig', 'sheep', 'chicken'];
for (const animal of animals) {
  if (isCancelled() || lib.time().secondsUntilNight < 120) break;
  try {
    console.log(`Hunting ${animal}...`);
    const res = await lib.hunt(animal, 2);
    console.log(`Hunt result:`, JSON.stringify(res));
    if (res.killed > 0) break;
  } catch (e) {
    console.log(`Hunt ${animal} error:`, e.message);
  }
}

// Step 5: Check furnace for smelted iron and cook any raw meat
await lib.goTo(294, 72, -55, 1);
const fb = bot.blockAt(new Vec3(295, 72, -55));
if (fb) {
  try {
    const furnace = await bot.openFurnace(fb);
    const out = furnace.outputItem();
    if (out) {
      console.log(`Withdrawing smelted output: ${out.name} x${out.count}`);
      await furnace.takeOutput();
    }
    
    // Put raw meat in if we have any
    const rawMeat = bot.inventory.items().find(i => ['beef', 'porkchop', 'mutton', 'chicken'].includes(i.name));
    if (rawMeat) {
      console.log(`Putting ${rawMeat.name} into furnace to cook...`);
      await furnace.putInput(rawMeat.type, null, rawMeat.count);
    }
    furnace.close();
  } catch (e) {
    console.log('Furnace access error:', e.message);
  }
}

// Step 6: Craft shield if we have iron ingot and 6 planks
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  console.log('Crafting shield...');
  try {
    await lib.craft('shield', 1);
    console.log('Shield crafted successfully!');
  } catch (e) {
    console.log('Craft shield error:', e.message);
  }
}

// Equip shield in offhand
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

console.log('=== RESULT ===');
console.log(`HP: ${bot.health}, Food: ${bot.food}`);
console.log(`Inventory:`, JSON.stringify(lib.inv()));

return {
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
