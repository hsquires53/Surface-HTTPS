// Utility functions

// Compute least-squares affine fit
function fitAffine2D(anchors) {
    // Solves for [a, b, c, d, e, f] in:
    //   pixelY = a*gameX + b*gameY + c
    //   pixelX = d*gameX + e*gameY + f
    // Using normal equations: X^T X beta = X^T y
    const n = anchors.length;
    const X = [], yY = [], yX = [];
    for (const pt of anchors) {
        const [gx, gy] = pt.game;
        X.push([gx, gy, 1]);
        yY.push(pt.pixel[0]);
        yX.push(pt.pixel[1]);
    }

    function transpose(A) {
        return A[0].map((_, i) => A.map(row => row[i]));
    }

    function multiply(A, B) {
        return A.map(row => B[0].map((_, j) => row.reduce((sum, v, i) => sum + v * B[i][j], 0)));
    }

    function invert3x3(m) {
        const [a, b, c] = m[0];
        const [d, e, f] = m[1];
        const [g, h, i] = m[2];
        const A = e*i - f*h, B = c*h - b*i, C = b*f - c*e;
        const D = f*g - d*i, E = a*i - c*g, F = c*d - a*f;
        const G = d*h - e*g, H = b*g - a*h, I = a*e - b*d;
        const det = a*A + b*D + c*G;
        if (Math.abs(det) < 1e-12) return null;
        return [
            [A/det, B/det, C/det],
            [D/det, E/det, F/det],
            [G/det, H/det, I/det]
        ];
    }

    function solve3x3(A, b) {
        const invA = invert3x3(A);
        if (!invA) return [0,0,0];
        return invA.map(row => row[0]*b[0] + row[1]*b[1] + row[2]*b[2]);
    }

    // Compute (X^T X) and (X^T y)
    const XT = transpose(X);
    const XTX = multiply(XT, X);
    const XTyY = XT.map(row => row.reduce((sum, v, i) => sum + v * yY[i], 0));
    const XTyX = XT.map(row => row.reduce((sum, v, i) => sum + v * yX[i], 0));
    const betaY = solve3x3(XTX, XTyY);
    const betaX = solve3x3(XTX, XTyX);
    
    // Return [a, b, c, d, e, f]
    return [betaY[0], betaY[1], betaY[2], betaX[0], betaX[1], betaX[2]];
}

// Get region from korok ID
function getRegionFromId(id) {
    const prefix = id.split('-')[0];
    switch (prefix) {
        case 'HE': return 'Hebra';
        case 'GE': return 'Gerudo';
        case 'NE': return 'Necluda';
        case 'LA': return 'Lanayru';
        case 'EL': return 'Eldin';
        case 'AK': return 'Akkala';
        case 'FA': return 'Faron';
        case 'HR': return 'Hyrule Field';
        default: return 'Unknown';
    }
}

// Load saved found status from localStorage
function loadSavedStatus() {
    korokData.forEach(korok => {
        const saved = localStorage.getItem(`korok_${korok.id}`);
        if (saved !== null) {
            korok.found = saved === 'true';
        }
    });
}

// Update location filter options based on selected region
function updateLocationFilter(region) {
    const locationFilter = document.getElementById('location-filter');
    const locations = new Set();
    
    korokData.forEach(korok => {
        if (region === 'all' || korok.region === region) {
            locations.add(korok.location);
        }
    });

    locationFilter.innerHTML = '<option value="all">All Locations</option>';
    Array.from(locations).sort().forEach(location => {
        if (location) {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        }
    });
} 