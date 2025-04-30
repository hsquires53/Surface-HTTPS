// Region-specific calibration points and transformations

// Necluda region calibration
const NE_ANCHORS = [
    { game: [1291, -1331], pixel: [-1744, 2062] }, // NE-828
    { game: [1536, -1302], pixel: [-1733, 2131] }, // NE-829
    { game: [1626, -1360], pixel: [-1755, 2158] }, // NE-830
    { game: [1785, -1551], pixel: [-1812, 2214] }, // NE-831
    { game: [1153, -1703], pixel: [-1858, 2024] }, // NE-832
    { game: [1373, -1679], pixel: [-1842, 2086] }  // NE-833
];

// Hebra region calibration
const HEBRA_ANCHORS = [
    { game: [-4429, 3684], pixel: [-236, 347] },  // HE-62
    { game: [-4508, 3465], pixel: [-220, 380] },  // HE-63
    { game: [-4422, 3215], pixel: [-180, 420] },  // HE-65
    { game: [-3992, 3835], pixel: [-50, 320] },   // HE-66
    { game: [-4632, 2820], pixel: [-250, 480] }   // HE-74
];

// Gerudo region calibration
const GERUDO_ANCHORS = [
    { game: [-4909, -1246], pixel: [-1724, 206] }, // GE-220
    { game: [-4538, -1348], pixel: [-1744, 311] }, // GE-222
    { game: [-4691, -1235], pixel: [-1725, 271] }, // GE-221
    { game: [-4321, -1089], pixel: [-1681, 379] }  // GE-227
];

// Lanayru region calibration
const LANAYRU_ANCHORS = [
    { game: [4272, 136], pixel: [-1301, 2955] },   // LA-748
    { game: [4324, -141], pixel: [-1389, 2974] },  // LA-751
    { game: [4457, -354], pixel: [-1446, 3017] },  // LA-754
    { game: [4499, -648], pixel: [-1538, 3025] }   // LA-757
];

// Compute affine transformations
const NE_AFFINE = fitAffine2D(NE_ANCHORS);
const HEBRA_AFFINE = fitAffine2D(HEBRA_ANCHORS);
const GERUDO_AFFINE = fitAffine2D(GERUDO_ANCHORS);
const LANAYRU_AFFINE = fitAffine2D(LANAYRU_ANCHORS);

// Game coordinates to pixel coordinates transformation
function gameToPixel(gameX, gameY, region) {
    // Use region-specific calibration if available
    if (region === 'Hebra' || (typeof region === 'undefined' && typeof gameX === 'string' && gameX.startsWith('HE-'))) {
        const [a, b, c, d, e, f] = HEBRA_AFFINE;
        const pixelY = a * gameX + b * gameY + c;
        const pixelX = d * gameX + e * gameY + f;
        return [pixelY, pixelX];
    }
    
    if (region === 'Necluda' || (typeof region === 'undefined' && typeof gameX === 'string' && gameX.startsWith('NE-'))) {
        const [a, b, c, d, e, f] = NE_AFFINE;
        const pixelY = a * gameX + b * gameY + c;
        const pixelX = d * gameX + e * gameY + f;
        return [pixelY, pixelX];
    }

    if (region === 'Gerudo' || (typeof region === 'undefined' && typeof gameX === 'string' && gameX.startsWith('GE-'))) {
        const [a, b, c, d, e, f] = GERUDO_AFFINE;
        const pixelY = a * gameX + b * gameY + c;
        const pixelX = d * gameX + e * gameY + f;
        return [pixelY, pixelX];
    }

    if (region === 'Lanayru' || (typeof region === 'undefined' && typeof gameX === 'string' && gameX.startsWith('LA-'))) {
        const [a, b, c, d, e, f] = LANAYRU_AFFINE;
        const pixelY = a * gameX + b * gameY + c;
        const pixelX = d * gameX + e * gameY + f;
        return [pixelY, pixelX];
    }

    // Default transformation for other regions
    const ref1GameX = -4429;  // HE-62 (Top Left)
    const ref1GameY = 3684;
    const ref1PixelX = 347;
    const ref1PixelY = -236;
    const ref2GameX = 4541;   // AK-629 (Top Right)
    const ref2GameY = 3162;
    const ref2PixelX = 3035;
    const ref2PixelY = -396;
    const xScale = (ref2PixelX - ref1PixelX) / (ref2GameX - ref1GameX);
    const yScale = (ref2PixelY - ref1PixelY) / (ref2GameY - ref1GameY);
    const pixelX = Math.round(ref1PixelX + (gameX - ref1GameX) * xScale);
    const pixelY = Math.round(ref1PixelY + (gameY - ref1GameY) * yScale);
    return [pixelY, pixelX];
} 