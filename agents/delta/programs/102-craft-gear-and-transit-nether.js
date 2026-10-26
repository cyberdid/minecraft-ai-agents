// programs/102-craft-gear-and-transit-nether.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Move into base shelter
console.log('Moving into base shelter at (294, 72, -56)...');
try {
  await lib.goTo(294, 72, -56);
} catch (e) {
  console.log('goTo base note:', e.message);
  await lib.goTo(294, 72, -54);
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

const tablePos = new Vec3(295, 72, -56);
const tableBlock = bot.blockAt(tablePos);

// 2. Craft wooden_pickaxe if we don't have a pickaxe
if (tableBlock && lib.count('*_pickaxe') === 0 && lib.count('*_planks') >= 3 && lib.count('stick') >= 2) {
  console.log('Crafting wooden_pickaxe at base table...');
  const wp = mcData.itemsByName.wooden_pickaxe;
  const rec = bot.recipesFor(wp.id, null, 1, tableBlock)[0];
  if (rec) {
    await bot.craft(rec, 1, tableBlock);
    await sleep(200);
    await lib.stowCursor();
    console.log('Crafted wooden_pickaxe!');
  }
}

// 3. Mine 8 stone/cobblestone to make stone tools
if (lib.count('*_pickaxe') > 0 && lib.count('cobblestone') < 8) {
  console.log('Mining 8 cobblestone...');
  const stoneBlocks = bot.findBlocks({
    matching: b => ['stone', 'cobblestone', 'deepslate'].includes(b.name),
    maxDistance: 8,
    count: 8
  });
  for (const s of stoneBlocks) {
    if (lib.count('cobblestone') >= 8) break;
    // Don't break base walls (x=292..296, y=72..75, z=-58..-54)
    if (s.y >= 71 && s.x >= 292 && s.x <= 296 && s.z >= -58 && s.z <= -54) continue;
    try {
      await lib.dig(s.x, s.y, s.z);
      await lib.pickup(4);
    } catch (err) {}
  }
  console.log('Cobblestone count:', lib.count('cobblestone'));
}

// 4. Craft stone_pickaxe and stone_sword
if (tableBlock && lib.count('cobblestone') >= 3 && !lib.count('stone_pickaxe')) {
  console.log('Crafting stone_pickaxe...');
  const sp = mcData.itemsByName.stone_pickaxe;
  const rec = bot.recipesFor(sp.id, null, 1, tableBlock)[0];
  if (rec) {
    await bot.craft(rec, 1, tableBlock);
    await sleep(200);
    await lib.stowCursor();
    console.log('Crafted stone_pickaxe!');
  }
}

if (tableBlock && lib.count('cobblestone') >= 2 && !lib.count('stone_sword')) {
  console.log('Crafting stone_sword...');
  const ss = mcData.itemsByName.stone_sword;
  const rec = bot.recipesFor(ss.id, null, 1, tableBlock)[0];
  if (rec) {
    await bot.craft(rec, 1, tableBlock);
    await sleep(200);
    await lib.stowCursor();
    console.log('Crafted stone_sword!');
  }
}

// 5. Withdraw building blocks from chest
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(contents));
  const toW = {};
  if (contents.granite) toW.granite = Math.min(contents.granite, 32);
  if (contents.diorite) toW.diorite = Math.min(contents.diorite, 32);
  if (contents.andesite) toW.andesite = Math.min(contents.andesite, 32);
  if (contents.iron_ingot) toW.iron_ingot = contents.iron_ingot;
  if (Object.keys(toW).length > 0) {
    await lib.withdraw(toW, chestPos.x, chestPos.y, chestPos.z);
    console.log('Withdrew blocks:', JSON.stringify(toW));
  }
} catch (e) {}

await lib.equipWeapon();
console.log('Equipped gear:', JSON.stringify(lib.tools()));
console.log('Inventory before portal:', JSON.stringify(lib.inv()));

// 6. Step outside door (294, 72, -54)
console.log('Exiting base door to portal...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('goThroughDoor note:', e.message);
  await lib.goTo(294, 72, -52);
}

// 7. Jump into Nether portal at (299.5, 73.0, -54.0)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Jumping into portal at', lib.fmt(portalTarget));
await bot.lookAt(portalTarget.offset(0, 0.5, 0), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1200);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Stepped into portal frame at:', lib.fmt(bot.entity.position));
bot.chat('delta: In Nether portal frame! Transiting to Nether Fortress Outpost!');

// Wait for dimension change
const startDim = bot.game.dimension;
for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (bot.game.dimension !== startDim) {
    console.log(`TELEPORT SUCCESS! Dimension is now: ${bot.game.dimension}`);
    break;
  }
}

console.log('Pos final:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);

if (bot.game.dimension.includes('nether')) {
  bot.chat(`delta: Re-entered the Nether at ${lib.fmt(bot.entity.position)}! Advancing to Fortress Outpost (44, 66, -129).`);
}
