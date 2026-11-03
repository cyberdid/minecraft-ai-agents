// programs/560-check-furnaces-and-reply.js
console.log('=== CHECK FURNACES ===');
for (const fPos of [new Vec3(295, 72, -55), new Vec3(295, 72, -57)]) {
  const fb = bot.blockAt(fPos);
  if (fb && fb.name.includes('furnace')) {
    try {
      const fn = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(fPos)}:`);
      console.log('  input:', fn.inputItem() ? `${fn.inputItem().name} x${fn.inputItem().count}` : 'empty');
      console.log('  fuel:', fn.fuelItem() ? `${fn.fuelItem().name} x${fn.fuelItem().count}` : 'empty');
      console.log('  output:', fn.outputItem() ? `${fn.outputItem().name} x${fn.outputItem().count}` : 'empty');
      await fn.close();
    } catch (e) {
      console.log(`Error checking furnace at ${lib.fmt(fPos)}:`, e.message);
    }
  }
}

// Check players
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem ? p.entity.heldItem.name : 'empty'}`);
  }
}

bot.chat('gamma: I have iron_pickaxe, cobblestone, weapons, golden_boots. Alpha crafted diamond_pickaxe in Milestone 6!');
