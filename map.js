// Initialize the map
const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -3,
    maxZoom: 2,
    zoomControl: false, // We'll reposition the zoom control
    bounceAtZoomLimits: true,
    tap: true, // Enable tap handler for iOS Safari
    dragging: !L.Browser.mobile, // Disable dragging on mobile by default
});

// Add zoom control to the top right
L.control.zoom({
    position: 'topright'
}).addTo(map);

// Enable dragging after a short delay on mobile
if (L.Browser.mobile) {
    setTimeout(() => {
        map.dragging.enable();
    }, 1000);
}

// Set map bounds
const bounds = [[0, 0], [2575, 3309]];
const image = L.imageOverlay('images/Surface Map.jpg', bounds).addTo(map);
map.fitBounds(bounds);
map.setView([1200, 1600], 0);

// Adjust icon size for mobile
const iconSize = L.Browser.mobile ? 35 : 25;
const iconAnchor = L.Browser.mobile ? 17 : 12;

// Custom icon for Koroks
const korokIcon = L.icon({
    iconUrl: 'images/Seed.png',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconAnchor, iconAnchor],
    popupAnchor: [0, -iconAnchor]
});

// Known reference markers with exact pixel coordinates
const REFERENCE_MARKERS = {
    'HR-459': {
        game: { x: -236, y: 632 },
        pixel: { x: 1605, y: 1420 },
        region: 'Hyrule Field',
        location: 'Central Square',
        description: 'Rock under the broken statue',
        puzzleType: 'Lift Rock'
    },
    'HR-460': {
        game: { x: -269, y: 608 },
        pixel: { x: 1591, y: 1413 },
        region: 'Hyrule Field',
        location: 'Central Square',
        description: 'Follow the light pattern',
        puzzleType: 'Chase Lights'
    },
    'HR-465': {
        game: { x: -254, y: 424 },
        pixel: { x: 1599, y: 1354 },
        region: 'Hyrule Field',
        location: 'Castle Town',
        description: 'Find the Korok hiding in the ruins',
        puzzleType: 'Find Friend'
    },
    'NE-828': {
        game: { x: 1291, y: -1331 },
        pixel: { x: 2065, y: 829 },
        region: 'Necluda',
        location: 'Cliffs of Quince',
        description: 'Shoot the balloon under the cliff',
        puzzleType: 'Shoot Target'
    },
    'NE-829': {
        game: { x: 1536, y: -1302 },
        pixel: { x: 2134, y: 838 },
        region: 'Necluda',
        location: 'Cliffs of Quince',
        description: 'Pull the stone plug at the top',
        puzzleType: 'Pull Plug'
    },
    'NE-830': {
        game: { x: 1626, y: -1360 },
        pixel: { x: 2163, y: 820 },
        region: 'Necluda',
        location: 'Cliffs of Quince',
        description: 'Complete the light ring puzzle',
        puzzleType: 'Light Ring'
    }
};

// Store reference markers
let referenceMarkers = new Map();

// Initialize filters
let regionFilter;
let locationFilter;
let showFoundCheckbox;

// Place reference markers
function placeReferenceMarkers() {
    // Clear any existing markers
    referenceMarkers.forEach(marker => marker.remove());
    referenceMarkers.clear();

    // Place each reference marker at its exact pixel coordinates
    Object.entries(REFERENCE_MARKERS).forEach(([id, data]) => {
        console.log(`Placing reference marker ${id} at:`, data.pixel);
        
        // Create marker at exact pixel coordinates
        const marker = L.marker([data.pixel.y, data.pixel.x], {
            icon: korokIcon
        });

        const popupContent = `
            <div class="korok-popup">
                <strong>${id}</strong><br>
                ${data.region} - ${data.location}<br>
                ${data.puzzleType}<br>
                ${data.description}<br>
                <button class="reference-marker">
                    Reference Point<br>
                    Game: (${data.game.x}, ${data.game.y})<br>
                    Pixel: (${data.pixel.x}, ${data.pixel.y})
                </button>
            </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(map);
        referenceMarkers.set(id, marker);
    });
}

// Store all markers
let markers = [];
let korokData = [];

// Convert game coordinates to pixel coordinates using reference points
function gameToPixel(gameX, gameY) {
    // Define the game coordinate bounds
    const GAME_MIN_X = -4909;
    const GAME_MAX_X = 4897;
    const GAME_MIN_Y = -3775;
    const GAME_MAX_Y = 3753;

    // Define the pixel coordinate bounds
    const PIXEL_MIN_X = 305;
    const PIXEL_MAX_X = 3148;
    const PIXEL_MIN_Y = 120;
    const PIXEL_MAX_Y = 2352;

    // Calculate the percentage of position within bounds
    const percentX = (gameX - GAME_MIN_X) / (GAME_MAX_X - GAME_MIN_X);
    const percentY = (gameY - GAME_MIN_Y) / (GAME_MAX_Y - GAME_MIN_Y);

    // Convert to pixel coordinates using linear interpolation
    const pixelX = PIXEL_MIN_X + (percentX * (PIXEL_MAX_X - PIXEL_MIN_X));
    const pixelY = PIXEL_MIN_Y + (percentY * (PIXEL_MAX_Y - PIXEL_MIN_Y));

    return [pixelY, pixelX];
}

// Load CSV data
async function loadCSVData() {
    try {
        const response = await fetch('http://localhost:8000/hyrule_data.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        const rows = csvText.split('\n');
        
        // Get header row
        const headers = rows[0].split(',');
        const columnMap = {
            id: headers.indexOf('ID'),
            x: headers.indexOf('Coordinates (X)'),
            y: headers.indexOf('Coordinates (Y)'),
            z: headers.indexOf('Coordinates (Z)'),
            region: headers.indexOf('Region'),
            location: headers.indexOf('Location'),
            puzzleType: headers.indexOf('Puzzle Type'),
            description: headers.indexOf('Description')
        };
        
        // Process each row
        korokData = [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim();
            if (!row) continue;
            
            const columns = row.split(',');
            if (columns.length < 8) continue;
            
            korokData.push({
                id: columns[columnMap.id].trim(),
                gameX: parseFloat(columns[columnMap.x].trim()),
                gameY: parseFloat(columns[columnMap.y].trim()),
                gameZ: parseFloat(columns[columnMap.z].trim()),
                region: columns[columnMap.region].trim(),
                location: columns[columnMap.location].trim(),
                puzzleType: columns[columnMap.puzzleType].trim(),
                description: columns[columnMap.description].trim(),
                found: false
            });
        }
        
        updateFilters();
        updateMarkers();
        updateStats();
        
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
}

// Create popup content for a marker
function createPopupContent(korok) {
    const content = `
        <div class="korok-popup">
            <strong>ID: ${korok.id}</strong><br>
            Game Coordinates: (${Math.round(korok.gameX)}, ${Math.round(korok.gameY)})<br>
            Type: ${korok.puzzleType}<br>
            Description: ${korok.description}<br>
            <button onclick="toggleFound('${korok.id}')" class="${korok.found ? 'found' : ''}" style="width: 100%; padding: 8px; margin-top: 5px;">
                ${korok.found ? 'Found!' : 'Mark as Found'}
            </button>
        </div>
    `;
    return content;
}

// Update markers on the map
function updateMarkers() {
    // Clear existing markers
    markers.forEach(marker => marker.remove());
    markers = [];
    
    // Keep reference markers
    placeReferenceMarkers();
    
    // Add new markers
    korokData.forEach(korok => {
        // Skip if this is a reference marker
        if (REFERENCE_MARKERS[korok.id]) return;
        
        try {
            const [y, x] = gameToPixel(korok.gameX, korok.gameY);
            
            const marker = L.marker([y, x], {
                icon: korokIcon,
                opacity: korok.found ? 0.5 : 1.0
            });
            
            marker.bindPopup(createPopupContent(korok));
            marker.addTo(map);
            markers.push(marker);
        } catch (error) {
            console.error(`Error adding marker for ${korok.id}:`, error);
        }
    });
}

// Update filter options
function updateFilters() {
    const regions = [...new Set(korokData.map(k => k.region))].sort();
    const locations = [...new Set(korokData.map(k => k.location))].sort();
    
    regionFilter.innerHTML = '<option value="all">All Regions</option>' +
        regions.map(region => `<option value="${region}">${region}</option>`).join('');
    
    locationFilter.innerHTML = '<option value="all">All Locations</option>' +
        locations.map(location => `<option value="${location}">${location}</option>`).join('');
}

// Filter markers based on selection
function filterMarkers() {
    const selectedRegion = regionFilter.value;
    const selectedLocation = locationFilter.value;
    const showFound = showFoundCheckbox.checked;
    
    // Keep track of visible markers' bounds
    let visibleMarkers = [];
    
    markers.forEach((marker, index) => {
        const korok = korokData[index];
        if (!korok) return; // Skip if no corresponding data
        
        const regionMatch = selectedRegion === 'all' || korok.region === selectedRegion;
        const locationMatch = selectedLocation === 'all' || korok.location === selectedLocation;
        const foundMatch = showFound || !korok.found;
        
        if (regionMatch && locationMatch && foundMatch) {
            marker.addTo(map);
            visibleMarkers.push(marker);
        } else {
            marker.remove();
        }
    });
    
    // If specific region or location is selected, fit bounds to visible markers
    if (selectedRegion !== 'all' || selectedLocation !== 'all') {
        if (visibleMarkers.length > 0) {
            // Create a bounds object
            const bounds = L.latLngBounds(visibleMarkers.map(marker => marker.getLatLng()));
            
            // Add some padding around the bounds (10% of the map size)
            const padding = [
                Math.min(map.getSize().y * 0.1, 100),
                Math.min(map.getSize().x * 0.1, 100)
            ];
            
            // Fit the map to the bounds with padding
            map.fitBounds(bounds, {
                padding: padding,
                maxZoom: 1  // Prevent zooming in too close
            });
        }
    }
    
    updateStats();
}

// Toggle found status for a korok
function toggleFound(id) {
    const korok = korokData.find(k => k.id === id);
    if (korok) {
        korok.found = !korok.found;
        updateMarkers();
        updateStats();
        saveProgress();
    }
}

// Update statistics
function updateStats() {
    const foundCount = korokData.filter(k => k.found).length;
    const totalCount = korokData.length;
    document.getElementById('found-count').textContent = foundCount;
    document.getElementById('total-count').textContent = totalCount;
}

// Save progress to localStorage
function saveProgress() {
    const progress = korokData.reduce((acc, korok) => {
        acc[korok.id] = korok.found;
        return acc;
    }, {});
    localStorage.setItem('korokProgress', JSON.stringify(progress));
}

// Load progress from localStorage
function loadProgress() {
    const progress = JSON.parse(localStorage.getItem('korokProgress') || '{}');
    korokData.forEach(korok => {
        korok.found = progress[korok.id] || false;
    });
    updateMarkers();
    updateStats();
}

// Initialize the map
document.addEventListener('DOMContentLoaded', function() {
    // Initialize filter elements
    regionFilter = document.getElementById('region-filter');
    locationFilter = document.getElementById('location-filter');
    showFoundCheckbox = document.getElementById('show-found');

    // Add event listeners
    regionFilter.addEventListener('change', filterMarkers);
    locationFilter.addEventListener('change', filterMarkers);
    showFoundCheckbox.addEventListener('change', filterMarkers);

    // Load all markers
    loadCSVData().then(() => {
        loadProgress();
    });
}); 