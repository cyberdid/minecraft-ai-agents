// programs/471-check-furnaces-and-gear.js
console.log('Delta at:', lib.fmt(bot.entity.position));

// 1. Move securely inside base house (293, 72, -56)
try {
  await bot.pathfinder.goto(new goals.GoalNear(293, 72, -56, 0.5));
} catch (e) {}

// 2. Check all furnaces for smelted ingots/food
for (const fpos of [new Vec3(295, 72, -55), new Vec3(295, 72, -54), new Vec3(295, 72, -56)]) {
  const fb = bot.blockAt(fpos);
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      const input = f.inputItem();
      const fuel = f.fuelItem();
      const output = f.outputItem();
      console.log(`Furnace at ${lib.fmt(fpos)}: input=${input?.name} x${input?.count}, fuel=${fuel?.name} x${fuel?.count}, output=${output?.name} x${output?.count}`);
      if (output) {
        await f.takeOutput();
        console.log(`Took output: ${output.name} x${output.count}`);
      }
      f.close();
    } catch (e) {
      console.log(`Furnace ${lib.fmt(fpos)} error:`, e.message);
    }
  }
}

// 3. Equip armor and weapon
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

console.log('Delta status: pos=', lib.fmt(bot.entity.position), 'held=', bot.heldItem?.name, 'offhand=', bot.inventory.slots[45]?.name);
console.log('Inventory:', JSON.stringify(lib.inv()));

return { pos: bot.entity.position, hp: bot.health, food: bot.food, inv: lib.inv() };
