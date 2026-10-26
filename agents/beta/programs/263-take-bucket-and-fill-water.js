// programs/263-take-bucket-and-fill-water.js
console.log('=== Step 21: Take bucket from chest and fill with water ===');

const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chest));

if (chest.bucket) {
  console.log(`Withdrawing bucket from chest...`);
  await lib.withdraw({ bucket: 1 }, chestPos.x, chestPos.y, chestPos.z);
}

console.log('Beta inv before water fill:', JSON.stringify(lib.inv()));

if (lib.count('bucket') > 0) {
  console.log('Exiting base to fill bucket with water...');
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    await lib.goTo(294, 72, -52, 1);
  }

  try {
    console.log('Filling bucket with water...');
    await lib.fillBucket('water');
    console.log(`Water bucket status: ${lib.count('water_bucket')} water_bucket!`);
    bot.chat('alpha: Filled water bucket! Milestone 5 complete for both of us!');
  } catch (e) {
    console.log('fillBucket error:', e.message);
  }

  // Return to base
  console.log('Returning to base...');
  await lib.goTo(294, 72, -53, 1);
  try {
    await lib.goThroughDoor(294, 72, -54);
    console.log('Safely inside base!');
  } catch (e) {}
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
console.log('Time left until night:', lib.time().secondsUntilNight);
