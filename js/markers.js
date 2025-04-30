// Marker handling and coordinates

// Process korok data with coordinates and metadata
function processKorokData(korok) {
    const coordinates = gameToPixel(korok.gameX, korok.gameY, korok.region);
    return {
        id: korok.id,
        coordinates,
        region: korok.region || getRegionFromId(korok.id),
        location: korok.location || '',
        puzzleType: korok.puzzleType || '',
        description: korok.description || '',
        found: korok.found || false
    };
}

// Add markers to the map
function addKorokMarkers() {
    // Clear existing markers
    markers.forEach(marker => marker.remove());
    markers = [];

    // Add new markers
    korokData.forEach(korok => {
        const marker = L.marker(korok.coordinates, {
            icon: customKorokIcon,
            className: korok.found ? 'marker-found' : ''
        }).addTo(map);

        marker.bindPopup(createPopupContent(korok));
        markers.push(marker);
    });

    updateStats();
}

// Create popup content for markers
function createPopupContent(korok) {
    const content = document.createElement('div');
    content.className = 'korok-popup';
    content.innerHTML = `
        <strong>${korok.id}</strong><br>
        Region: ${korok.region}<br>
        Location: ${korok.location}<br>
        Puzzle Type: ${korok.puzzleType}<br>
        Description: ${korok.description}<br>
        <button class="${korok.found ? 'found' : ''}" onclick="toggleFound('${korok.id}')">
            ${korok.found ? 'Mark as Not Found' : 'Mark as Found'}
        </button>
    `;
    return content;
}

// Toggle found status for markers
function toggleFound(id) {
    const korok = korokData.find(k => k.id === id);
    if (korok) {
        korok.found = !korok.found;
        localStorage.setItem(`korok_${id}`, korok.found);
        addKorokMarkers();
    }
}

// Update statistics
function updateStats() {
    const foundCount = korokData.filter(k => k.found).length;
    const totalCount = korokData.length;
    document.getElementById('found-count').textContent = foundCount;
    document.getElementById('total-count').textContent = totalCount;
}

// Filter markers based on region and found status
function filterMarkers() {
    const regionFilter = document.getElementById('region-filter').value;
    const locationFilter = document.getElementById('location-filter').value;
    const showFound = document.getElementById('show-found').checked;

    markers.forEach((marker, i) => {
        const korok = korokData[i];
        const regionMatch = regionFilter === 'all' || korok.region === regionFilter;
        const locationMatch = locationFilter === 'all' || korok.location === locationFilter;
        const foundMatch = showFound || !korok.found;

        if (regionMatch && locationMatch && foundMatch) {
            marker.addTo(map);
        } else {
            marker.remove();
        }
    });
} 