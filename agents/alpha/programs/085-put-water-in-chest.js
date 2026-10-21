// programs/085-put-water-in-chest.js
// Put water_bucket in base chest at (293, 72, -57) for Beta

console.log('alpha depositing water_bucket into chest at (293, 72, -57)...');

await lib.deposit({ water_bucket: 1 }, 293, 72, -57);

const contents = await lib.chestContents(293, 72, -57);
console.log('Chest contents now:', JSON.stringify(contents));

bot.chat('alpha: Placed water_bucket in base chest at (293, 72, -57) for you beta!');
