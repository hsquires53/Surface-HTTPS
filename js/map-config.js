// Map initialization and configuration
let map;
let markers = [];
let korokData = [];

const customKorokIcon = L.icon({
    iconUrl: 'images/Seed.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35]
});

// Initialize map
function initMap() {
    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 2
    });

    const bounds = [[-3000, 0], [0, 4000]];
    const image = L.imageOverlay('images/map.png', bounds).addTo(map);
    map.fitBounds(bounds);

    // Click handler for debugging
    map.on('click', e => {
        const coords = e.latlng;
        // Reverse the coordinate conversion for click handling
        const xScale = (3035 - 347) / (4541 - (-4429));
        const yScale = (2434 - 236) / (3684 - (-3664));
        const gameX = Math.round((coords.lng - 1608) / xScale - 254);
        const gameY = Math.round((coords.lat + 1326) / yScale + 424);
        L.popup()
            .setLatLng(coords)
            .setContent(`
                Click Coordinates: [${Math.round(coords.lat)}, ${Math.round(coords.lng)}]<br>
                Estimated Game: [${gameX}, ${gameY}]<br>
                Reference Points:<br>
                HE-62 (Top Left): [-4429, 3684] -> [-236, 347]<br>
                AK-629 (Top Right): [4541, 3162] -> [-396, 3035]<br>
                NE-880 (Bottom Right): [4536, -3664] -> [-2442, 3041]<br>
                GE-220 (Bottom Left): [-4909, -1246] -> [-1724, 206]<br>
                HR-465 (Center): [-254, 424] -> [-1328, 1607]
            `)
            .openOn(map);
    });
} 