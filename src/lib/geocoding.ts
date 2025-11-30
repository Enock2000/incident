import type { Coordinates, Address } from './types';

// Zambia province capitals with known coordinates
const ZAMBIA_PROVINCE_COORDS: Record<string, Coordinates> = {
    'Lusaka': { latitude: -15.4167, longitude: 28.2833, geocoded: false },
    'Copperbelt': { latitude: -12.8, longitude: 28.2, geocoded: false },
    'Central': { latitude: -14.4333, longitude: 28.3333, geocoded: false },
    'Eastern': { latitude: -13.6333, longitude: 32.65, geocoded: false },
    'Luapula': { latitude: -11.6667, longitude: 29.1167, geocoded: false },
    'Muchinga': { latitude: -10.2833, longitude: 31.95, geocoded: false },
    'Northern': { latitude: -10.2, longitude: 31.1833, geocoded: false },
    'North-Western': { latitude: -13.4333, longitude: 24.4, geocoded: false },
    'Northwestern': { latitude: -13.4333, longitude: 24.4, geocoded: false },
    'Southern': { latitude: -16.8167, longitude: 27.8667, geocoded: false },
    'Western': { latitude: -15.6667, longitude: 23.1333, geocoded: false },
};

// Major district coordinates
const ZAMBIA_DISTRICT_COORDS: Record<string, Coordinates> = {
    'Lusaka': { latitude: -15.4167, longitude: 28.2833, geocoded: false },
    'Kitwe': { latitude: -12.8024, longitude: 28.2132, geocoded: false },
    'Ndola': { latitude: -12.9585, longitude: 28.6366, geocoded: false },
    'Livingstone': { latitude: -17.8419, longitude: 25.8544, geocoded: false },
    'Kabwe': { latitude: -14.4469, longitude: 28.4469, geocoded: false },
    'Chipata': { latitude: -13.6333, longitude: 32.6500, geocoded: false },
    'Kasama': { latitude: -10.2000, longitude: 31.1833, geocoded: false },
    'Mansa': { latitude: -11.1833, longitude: 28.8833, geocoded: false },
    'Mongu': { latitude: -15.2600, longitude: 23.1300, geocoded: false },
    'Solwezi': { latitude: -12.1667, longitude: 26.4000, geocoded: false },
    'Choma': { latitude: -16.8167, longitude: 26.9833, geocoded: false },
    'Mazabuka': { latitude: -15.8561, longitude: 27.7481, geocoded: false },
    'Chingola': { latitude: -12.5436, longitude: 27.8494, geocoded: false },
    'Mufulira': { latitude: -12.5472, longitude: 28.2400, geocoded: false },
    'Luanshya': { latitude: -13.1369, longitude: 28.4150, geocoded: false },
};

/**
  * Geocode an address using OpenStreetMap Nominatim API
 */
export async function geocodeAddress(address: Address): Promise<Coordinates | null> {
    try {
        // Build search query
        const parts = [
            address.address,
            address.constituency,
            address.district,
            address.province,
            'Zambia'
        ].filter(Boolean);

        const query = parts.join(', ');

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(query)}&` +
            `format=json&` +
            `countrycodes=zm&` +
            `limit=1`,
            {
                headers: {
                    'User-Agent': 'ZTIS-IncidentManagement/1.0'
                }
            }
        );

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
                geocoded: true,
                geocodedAt: new Date().toISOString()
            };
        }

        // Fallback to known coordinates
        return getFallbackCoordinates(address);
    } catch (error) {
        console.error('Geocoding error:', error);
        return getFallbackCoordinates(address);
    }
}

/**
 * Get fallback coordinates from known provinces/districts
 */
function getFallbackCoordinates(address: Address): Coordinates | null {
    // Normalize district/province names (trim, lowercase for comparison)
    const normalizeKey = (key: string) => key.trim().toLowerCase();

    // Try district first
    if (address.district) {
        const districtKey = Object.keys(ZAMBIA_DISTRICT_COORDS).find(
            key => normalizeKey(key) === normalizeKey(address.district!)
        );
        if (districtKey) {
            return ZAMBIA_DISTRICT_COORDS[districtKey];
        }
    }

    // Fall back to province
    if (address.province) {
        const provinceKey = Object.keys(ZAMBIA_PROVINCE_COORDS).find(
            key => normalizeKey(key) === normalizeKey(address.province!)
        );
        if (provinceKey) {
            return ZAMBIA_PROVINCE_COORDS[provinceKey];
        }
    }

    // Default to Lusaka (capital) if nothing matches
    return ZAMBIA_PROVINCE_COORDS['Lusaka'];
}

/**
 * Batch geocode multiple addresses with rate limiting
 */
export async function batchGeocode(addresses: Address[]): Promise<(Coordinates | null)[]> {
    const results: (Coordinates | null)[] = [];

    for (const address of addresses) {
        const coords = await geocodeAddress(address);
        results.push(coords);

        // Rate limit: wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
}
