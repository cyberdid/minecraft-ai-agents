const feet = bot.entity.position.floored();
console.log('Emergency sheltering at feet:', lib.fmt(feet));

const alphaPos = bot.players.alpha?.entity?.position?.floored();
console.log('Alpha at:', alphaPos ? lib.fmt(alphaPos) : 'unknown');

// Toss stone tools to alpha if alpha is nearby!
if (alphaPos && bot.entity.position.distanceTo(alphaPos) < 5) {
  try {
    const sp = mcData.itemsByName.stone_pickaxe.id;
    const sa = mcData.itemsByName.stone_axe.id;
    await bot.toss(sp, null, 1);
    await bot.toss(sa, null, 1);
    console.log('Tossed stone pickaxe and stone axe to alpha!');
    bot.chat("alpha: Tossed you a stone pickaxe and stone axe!");
  } catch (e) {
    console.log('Toss note:', e.message);
  }
}

// Determine bounding box to enclose both beta and alpha
const minX = Math.min(feet.x, alphaPos ? alphaPos.x : feet.x) - 1;
const maxX = Math.max(feet.x, alphaPos ? alphaPos.x : feet.x) + 1;
const minZ = Math.min(feet.z, alphaPos ? alphaPos.z : feet.z) - 1;
const maxZ = Math.max(feet.z, alphaPos ? alphaPos.z : feet.z) + 1;
const yFeet = feet.y;

console.log(`Enclosing box: x:[${minX}..${maxX}], z:[${minZ}..${maxZ}], y:[${yFeet}..${yFeet + 2}]`);

const blocksToPlace = [];
const mat = lib.count('oak_planks') > 0 ? 'oak_planks' : 'dirt';

// Walls around the perimeter for y = yFeet and y = yFeet + 1
for (let y = yFeet; y <= yFeet + 1; y++) {
  for (let x = minX; x <= maxX; x++) {
    for (let z = minZ; z <= maxZ; z++) {
      const isPerimeter = (x === minX || x === maxX || z === minZ || z === maxZ);
      if (isPerimeter) {
        const cur = bot.blockAt(new Vec3(x, y, z));
        if (!cur || cur.boundingBox !== 'block') {
          blocksToPlace.push({ x, y, z, name: mat });
        }
      }
    }
  }
}

// Roof at y = yFeet + 2
for (let x = minX; x <= maxX; x++) {
  for (let z = minZ; z <= maxZ; z++) {
    const cur = bot.blockAt(new Vec3(x, yFeet + 2, z));
    if (!cur || cur.boundingBox !== 'block') {
      blocksToPlace.push({ x, y: yFeet + 2, z, name: mat });
    }
  }
}

console.log('Blocks to place for enclosure:', blocksToPlace.length);
console.log('Available planks:', lib.count('oak_planks'), 'dirt:', lib.count('dirt'));

const res = await lib.build(blocksToPlace, { replace: false });
console.log('Build result:', JSON.stringify(res));

bot.chat("alpha: Shelter sealed! Safe for the night.");
return lib.status();
