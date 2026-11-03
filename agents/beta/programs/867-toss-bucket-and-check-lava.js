// programs/867-toss-bucket-and-check-lava.js
console.log('=== Program 867: Toss Bucket to Delta & Inspect (297, 73, -53) ===');

// Check block at (297, 73, -53)
const lb = bot.blockAt(new Vec3(297, 73, -53));
console.log(`Block at (297, 73, -53): ${lb ? lb.name : 'null'}, meta=${lb ? lb.metadata : 'null'}`);

// Walk to Delta at (299, 73, -52)
console.log('Walking towards Delta at (299, 73, -52)...');
try {
  await lib.goTo(298, 73, -52, 1.2, { timeoutMs: 5000 });
} catch (e) {}

// Toss 1 bucket to Delta
console.log('Tossing 1 empty bucket to Delta...');
try {
  const bkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (bkt) {
    await bot.lookAt(new Vec3(299.5, 73.5, -52.0), true);
    await bot.toss(bkt.type, null, 1);
    console.log('Tossed 1 bucket to Delta!');
    bot.chat('Beta: Tossed 1 bucket to Delta!');
  }
} catch (e) {
  console.log(`Toss error: ${e.message}`);
}

// If (297, 73, -53) is lava source and Beta still has a bucket, scoop it!
if (lb && lb.name === 'lava' && lb.metadata === 0 && lib.count('bucket') > 0) {
  console.log('Scooping lava source at (297, 73, -53)...');
  const bkt = bot.inventory.items().find(i => i.name === 'bucket');
  if (bkt) {
    await bot.equip(bkt, 'hand');
    await bot.lookAt(new Vec3(297.5, 73.5, -53.5), true);
    bot.activateItem();
    await sleep(800);
    console.log(`Lava bucket in inventory: ${lib.count('lava_bucket')}`);
  }
}

return {
  pos: bot.entity.position,
  bucket: lib.count('bucket'),
  lava_bucket: lib.count('lava_bucket')
};
