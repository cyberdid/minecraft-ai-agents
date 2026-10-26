// programs/027-sleep-in-bed.js
console.log('Time before:', JSON.stringify(lib.time()));
while (!isCancelled() && lib.time().timeOfDay < 12542) {
  await sleep(250);
}
console.log('Sleep window open! Calling lib.sleepInBed()...');
try {
  await lib.sleepInBed();
  console.log('Sleep completed!');
} catch (e) {
  console.log('sleepInBed error:', e.message);
}

console.log('Time after:', JSON.stringify(lib.time()));
bot.chat('delta: Slept in Bed 2! Morning is here!');
