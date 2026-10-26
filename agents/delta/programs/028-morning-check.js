// programs/028-morning-check.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

// Check teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}

// Check base chest
const chest = await lib.chestContents(293, 72, -57);
console.log('Chest contents:', JSON.stringify(chest));

// Check furnaces
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
for (const f of furnaces) {
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    console.log(`Furnace at ${lib.fmt(f)}: in=${fw.inputItem()?.name} out=${fw.outputItem()?.name}x${fw.outputItem()?.count}`);
    if (fw.outputItem()) {
      await fw.takeOutput();
      console.log('Took furnace output!');
    }
    await fw.close();
  } catch (e) {
    console.log('Furnace error:', e.message);
  }
}

// Check portal frame status
const portalFrame = lib.shapes.portal(298, 72, -54, 'x');
console.log('Portal status:', JSON.stringify(lib.materials(portalFrame)));

bot.chat('delta: Good morning! Portal site is ready at (298, 72, -54). Checking on Beta!');
