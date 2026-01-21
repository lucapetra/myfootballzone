const JimpPkg = require('jimp');
console.log('Jimp export keys:', Object.keys(JimpPkg));
try {
    if (typeof JimpPkg.read === 'function') {
        console.log('Jimp.read is available on default export');
    } else if (JimpPkg.Jimp && typeof JimpPkg.Jimp.read === 'function') {
        console.log('Jimp.read is available on .Jimp property');
    } else {
        console.log('Jimp structure is unknown');
    }
} catch (e) {
    console.log('Error inspecting Jimp:', e);
}
