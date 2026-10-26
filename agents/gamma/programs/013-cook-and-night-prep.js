// programs/013-cook-and-night-prep.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// Smelt beef in furnace at (295, 72, -55)
const furnaceBl = bot.blockAt(new Vec3(295, 72, -55));
if (furnaceBl) {
  try {
    const f = await bot.openFurnace(furnaceBl);
    // Put beef in input
    const beefItem = bot.inventory.items().find(i => i.name === 'beef');
    if (beefItem) {
      await f.putInput(beefItem.type, null, beefItem.count);
    }
    // Check fuel
    if (!f.fuelItem()) {
      const plankItem = bot.inventory.items().find(i => i.name.includes('planks'));
      if (plankItem) {
        await f.putFuel(plankItem.type, null, 1);
      }
    }
    console.log('Furnace cooking started. Waiting for cooked_beef...');
    const deadline = Date.now() + 20000;
    while (!f.outputItem() && Date.now() < deadline && !isCancelled()) {
      await sleep(1000);
    }
    if (f.outputItem()) {
      console.log('Smelted:', f.outputItem().name, 'x' + f.outputItem().count);
      await f.takeOutput();
    }
    f.close();
  } catch (e) {
    console.log('Furnace error:', e.message);
  }
}

// Eat if we have cooked_beef
if (lib.count('cooked_beef')) {
  console.log('Eating cooked_beef...');
  await lib.eat();
  console.log('Food now:', bot.food);
}

// Make sure door is closed
try {
  await lib.door(294, 72, -54, false);
} catch (e) {}

// Check players
for (const p of Object.values(bot.players)) {
  if (p.username !== 'gamma' && p.entity) {
    console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}`);
  }
}

console.log('Time:', lib.time().timeOfDay, lib.time().phase, 'night in:', lib.time().secondsUntilNight);
bot.chat(`gamma fed (food: ${bot.food}/20). Secured at base. Night in ${lib.time().secondsUntilNight}s.`);
