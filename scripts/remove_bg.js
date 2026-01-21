const { Jimp } = require('jimp');

async function removeBackground(inputPath, outputPath) {
    try {
        const image = await Jimp.read(inputPath);

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];

            // If pixel is white (or very close to white), make it transparent
            if (red > 250 && green > 250 && blue > 250) {
                this.bitmap.data[idx + 3] = 0; // Alpha to 0
            }
        });

        await image.write(outputPath);
        console.log(`Processed: ${inputPath} -> ${outputPath}`);
    } catch (err) {
        console.error(`Error processing ${inputPath}:`, err);
    }
}

async function main() {
    await removeBackground('assets/images/ac_milanese_solid.png', 'assets/images/ac_milanese_logo_transparent.png');
    await removeBackground('assets/images/asd_san_siro_solid.png', 'assets/images/asd_san_siro_logo_transparent.png');
}

main();
