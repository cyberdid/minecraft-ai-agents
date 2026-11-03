// programs/345-check-furnaces-and-gear.js
// Check all furnaces in base
for (const fz of [-54, -55, -56]) {
  const fPos = new Vec3(295, 72, fz);
  const fb = bot.blockAt(fPos);
  if (fb && fb.name.includes('furnace')) {
    try {
      const furnace = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(fPos)}: input=${furnace.inputItem()?.name}x${furnace.inputItem()?.count}, fuel=${furnace.fuelItem()?.name}x${furnace.fuelItem()?.count}, output=${furnace.outputItem()?.name}x${furnace.outputItem()?.count}`);
      if (furnace.outputItem()) {
        await furnace.takeOutput();
        console.log(`Took output from furnace at ${lib.fmt(fPos)}:`, furnace.outputItem()?.name);
      }
      furnace.close();
    } catch (e) {
      console.log(`Error reading furnace at ${lib.fmt(fPos)}:`, e.message);
    }
  }
}

// Check other players' gear/equipment if visible
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'gamma') {
    const held = p.entity.heldItem ? p.entity.heldItem.name : 'empty';
    console.log(`Player ${name} held: ${held}`);
  }
}

console.log('Gamma inv now:', JSON.stringify(lib.inv()));
