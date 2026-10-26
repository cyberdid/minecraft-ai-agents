// programs/041-sleep-in-bed2.js
const bed2 = bot.blockAt(new Vec3(293, 72, -55));
console.log('Bed 2 block:', bed2 ? bed2.name : 'null');
if (bed2 && bed2.name.includes('bed')) {
  try {
    await bot.sleep(bed2);
    console.log('Successfully sleeping in Bed 2!');
    await sleep(4000);
  } catch (e) {
    console.log('Sleep in Bed 2 error:', e.message);
  }
}
console.log('Time after sleep:', JSON.stringify(lib.time()));
bot.chat('delta: Sleeping in Bed 2 with Gamma to skip the night!');
