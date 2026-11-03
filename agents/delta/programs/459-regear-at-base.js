globalThis.isProgramCancelled = isCancelled;

console.log("Delta starting regear at:", lib.fmt(bot.entity.position));

// 1. Enter base through door
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log("goThroughDoor note:", e.message);
}

// 2. Open chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
try {
  await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 1));
  const chestBlock = bot.blockAt(chestPos);
  if (chestBlock) {
    const chest = await bot.openChest(chestBlock);
    const items = chest.items();
    console.log("Chest contents:", items.map(i => `${i.name} x${i.count}`).join(', '));

    // Withdraw food if available
    const foodItem = items.find(i => ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple'].includes(i.name));
    if (foodItem) {
      await chest.withdraw(foodItem.type, null, Math.min(foodItem.count, 16));
      console.log(`Withdrew ${foodItem.name} x${Math.min(foodItem.count, 16)}`);
    }

    // Withdraw cobblestone if available
    const cobble = items.find(i => i.name === 'cobblestone');
    if (cobble && lib.count('cobblestone') < 16) {
      await chest.withdraw(cobble.type, null, Math.min(cobble.count, 16));
      console.log(`Withdrew cobblestone x${Math.min(cobble.count, 16)}`);
    }

    // Withdraw iron/stone sword if available
    const sword = items.find(i => i.name === 'iron_sword' || i.name === 'stone_sword');
    if (sword) {
      await chest.withdraw(sword.type, null, 1);
      console.log(`Withdrew ${sword.name}`);
    }

    // Withdraw golden armor if available
    const goldArmor = items.find(i => i.name.startsWith('golden_'));
    if (goldArmor) {
      await chest.withdraw(goldArmor.type, null, 1);
      console.log(`Withdrew ${goldArmor.name}`);
    }

    chest.close();
  }
} catch (e) {
  console.log("Chest interaction note:", e.message);
}

// 3. Equip armor and weapon
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Check shield
const offhand = bot.inventory.slots[45];
console.log("Offhand:", offhand?.name, "Held:", bot.heldItem?.name);

// 4. Leave base through door towards portal
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

console.log("Delta ready to enter portal at:", lib.fmt(bot.entity.position), "Inv:", JSON.stringify(lib.inv()));
return { pos: bot.entity.position, inv: lib.inv(), hp: bot.health, food: bot.food };
