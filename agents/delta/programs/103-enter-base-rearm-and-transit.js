// programs/103-enter-base-rearm-and-transit.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Enter base through door (294, 72, -54)
console.log('Entering base through door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door enter note:', e.message);
  await lib.walkTo(294, -56);
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

const tablePos = new Vec3(295, 72, -56);
const tableBlock = bot.blockAt(tablePos);
const chestPos = new Vec3(293, 72, -57);

// 2. Mine 2-3 cobblestone if we need for stone pickaxe / sword
if (lib.count('cobblestone') < 5) {
  console.log('Mining cobblestone...');
  const stone = bot.findBlocks({
    matching: b => ['stone', 'cobblestone', 'deepslate'].includes(b.name),
    maxDistance: 6,
    count: 3
  });
  for (const s of stone) {
    if (s.y >= 71 && s.x >= 292 && s.x <= 296 && s.z >= -58 && s.z <= -54) continue;
    try {
      await lib.dig(s.x, s.y, s.z);
      await lib.pickup(4);
    } catch (err) {}
  }
}

// 3. Craft stone_pickaxe and stone_sword
if (tableBlock) {
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
}

// 4. Withdraw blocks and supplies from chest
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(contents));
  const toW = {};
  if (contents.granite) toW.granite = Math.min(contents.granite, 32);
  if (contents.diorite) toW.diorite = Math.min(contents.diorite, 32);
  if (contents.andesite) toW.andesite = Math.min(contents.andesite, 32);
  // Check food for Beta
  for (const f of ['cooked_beef', 'cooked_chicken', 'cooked_porkchop', 'bread', 'apple']) {
    if (contents[f]) {
      toW[f] = contents[f];
      break;
    }
  }
  if (Object.keys(toW).length > 0) {
    await lib.withdraw(toW, chestPos.x, chestPos.y, chestPos.z);
    console.log('Withdrew:', JSON.stringify(toW));
  }
} catch (e) {}

await lib.equipWeapon();
console.log('Gear equipped:', JSON.stringify(lib.tools()));
console.log('Inventory before transit:', JSON.stringify(lib.inv()));

// 5. Exit base through door
console.log('Exiting base door to portal...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door exit note:', e.message);
}

// 6. Navigate to portal approach (299, 72, -52)
console.log('Navigating to portal approach...');
await lib.walkTo(299, -52);
await sleep(300);

// 7. Jump into Nether portal block (299.5, 73.0, -54.0)
const portalTarget = new Vec3(299.5, 73.0, -54.0);
console.log('Jumping into portal at', lib.fmt(portalTarget));
await bot.lookAt(portalTarget.offset(0, 0.5, 0), true);
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(1200);
bot.setControlState('jump', false);
bot.setControlState('forward', false);

console.log('Stepped into portal! Pos:', lib.fmt(bot.entity.position));
bot.chat('delta: In Nether portal frame! Transiting now to deliver supplies to Fortress Outpost.');

// 8. Wait for dimension change
const startDim = bot.game.dimension;
for (let i = 0; i < 15; i++) {
  await sleep(1000);
  if (bot.game.dimension !== startDim) {
    console.log(`TELEPORT SUCCESS! Dimension: ${bot.game.dimension}`);
    break;
  }
}

console.log('Pos final:', lib.fmt(bot.entity.position), 'Dimension final:', bot.game.dimension);

if (bot.game.dimension.includes('nether')) {
  bot.chat(`delta: Re-entered Nether at ${lib.fmt(bot.entity.position)}! Advancing North to Fortress bunker (44, 66, -129).`);
}
