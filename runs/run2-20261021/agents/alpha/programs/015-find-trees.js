const trees = lib.find('*_log', { maxDistance: 128, count: 10 });
console.log('All trees found:', trees.map(t => `${t.name} at (${t.position.x}, ${t.position.y}, ${t.position.z})`));

const surfaceTrees = trees.filter(t => t.position.y >= 60);
console.log('Surface trees:', surfaceTrees.map(t => `${t.name} at (${t.position.x}, ${t.position.y}, ${t.position.z})`));
