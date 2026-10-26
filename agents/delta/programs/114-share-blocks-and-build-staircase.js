// programs/114-share-blocks-and-build-staircase.js
console.log('Pos before:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Toss 24 granite and 4 torches to Alpha and Beta in bunker
console.log('Sharing supplies with Alpha and Beta...');
try {
  await bot.lookAt(new Vec3(44.5, 65.5, -129.0), true);
  if (lib.count('granite') >= 24) {
    const graniteId = mcData.itemsByName.granite.id;
    await bot.toss(graniteId, null, 24);
    console.log('Tossed 24 granite to teammates!');
  }
  if (lib.count('torch') >= 4) {
    const torchId = mcData.itemsByName.torch.id;
    await bot.toss(torchId, null, 4);
    console.log('Tossed 4 torches to teammates!');
  }
} catch (e) {
  console.log('Toss note:', e.message);
}

bot.chat('delta: Tossed 24 granite blocks & 4 torches to Alpha/Beta! Building staircase down to fortress deck y=54.');

// 2. Inspect blocks along the staircase descent line (x=44, y=64..54, z=-130..-140)
console.log('Inspecting staircase descent path...');
for (let step = 1; step <= 11; step++) {
  const sy = 65 - step;
  const sz = -129 - step;
  const blk = bot.blockAt(new Vec3(44, sy, sz));
  console.log(`Step ${step} at (44, ${sy}, ${sz}): ${blk?.name}`);
}

// 3. Place staircase step blocks if needed
let placed = 0;
for (let step = 1; step <= 5; step++) {
  if (lib.count('andesite') < 3) break;
  const sy = 65 - step;
  const sz = -129 - step;
  const targetPos = new Vec3(44, sy, sz);
  const existing = bot.blockAt(targetPos);
  if (!existing || existing.name === 'air' || existing.name === 'cave_air') {
    try {
      console.log(`Placing staircase step at ${lib.fmt(targetPos)}...`);
      const res = await lib.place('andesite', targetPos.x, targetPos.y, targetPos.z);
      if (res === 'placed') placed++;
      console.log(`Placed step ${step}: ${res}`);
    } catch (err) {
      console.log(`Step ${step} place note:`, err.message);
    }
  }
}

console.log(`Placed ${placed} staircase steps. Andesite left: ${lib.count('andesite')}`);

// 4. Equip weapon
await lib.equipWeapon();
console.log('Equipped:', JSON.stringify(lib.tools()));
console.log('Delta inventory now:', JSON.stringify(lib.inv()));

bot.chat(`delta: Staircase progress: placed ${placed} steps. Andesite left: ${lib.count('andesite')}. Ready to secure corridor.`);
