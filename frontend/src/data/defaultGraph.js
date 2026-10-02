/**
 * Default Graph Datasets and procedural generation utilities
 */

export const SAMPLE_MUNICIPAL_DATASET = {
  name: "Official College Sample (6 Locations)",
  description: "Standard benchmark dataset featuring Municipal Office and 5 garbage collection points (A-E).",
  locations: [
    { id: 0, name: "Municipal Office", code: "O", isOffice: true, x: 180, y: 280, wasteCapacityKg: 0, binType: "Depot" },
    { id: 1, name: "Point A", code: "A", isOffice: false, x: 330, y: 160, wasteCapacityKg: 420, binType: "Recyclable" },
    { id: 2, name: "Point B", code: "B", isOffice: false, x: 530, y: 150, wasteCapacityKg: 680, binType: "Organic" },
    { id: 3, name: "Point C", code: "C", isOffice: false, x: 340, y: 420, wasteCapacityKg: 350, binType: "General" },
    { id: 4, name: "Point D", code: "D", isOffice: false, x: 550, y: 430, wasteCapacityKg: 510, binType: "Commercial" },
    { id: 5, name: "Point E", code: "E", isOffice: false, x: 680, y: 290, wasteCapacityKg: 490, binType: "Industrial" }
  ],
  distanceMatrix: [
    [0, 4, 7, 3, 6, 5],
    [4, 0, 5, 2, 4, 6],
    [7, 5, 0, 6, 3, 4],
    [3, 2, 6, 0, 5, 7],
    [6, 4, 3, 5, 0, 2],
    [5, 6, 4, 7, 2, 0]
  ]
};

export const SAMPLE_4_NODE_DATASET = {
  name: "Small Sector (4 Locations)",
  description: "Compact 4-node graph for quick manual viva verification.",
  locations: [
    { id: 0, name: "Municipal Office", code: "O", isOffice: true, x: 200, y: 260, wasteCapacityKg: 0, binType: "Depot" },
    { id: 1, name: "Point A", code: "A", isOffice: false, x: 380, y: 160, wasteCapacityKg: 300, binType: "Residential" },
    { id: 2, name: "Point B", code: "B", isOffice: false, x: 580, y: 260, wasteCapacityKg: 450, binType: "Market" },
    { id: 3, name: "Point C", code: "C", isOffice: false, x: 380, y: 380, wasteCapacityKg: 280, binType: "General" }
  ],
  distanceMatrix: [
    [0, 5, 9, 4],
    [5, 0, 6, 3],
    [9, 6, 0, 7],
    [4, 3, 7, 0]
  ]
};

export const SAMPLE_8_NODE_DATASET = {
  name: "Metropolitan District (8 Locations)",
  description: "Larger 8-location urban ward demonstrating substantial Branch and Bound pruning.",
  locations: [
    { id: 0, name: "Municipal Office", code: "O", isOffice: true, x: 180, y: 280, wasteCapacityKg: 0, binType: "Depot" },
    { id: 1, name: "Zone A (North Gate)", code: "A", isOffice: false, x: 280, y: 140, wasteCapacityKg: 400, binType: "Residential" },
    { id: 2, name: "Zone B (Civic Center)", code: "B", isOffice: false, x: 440, y: 120, wasteCapacityKg: 750, binType: "Commercial" },
    { id: 3, name: "Zone C (Market Hub)", code: "C", isOffice: false, x: 600, y: 170, wasteCapacityKg: 620, binType: "Market" },
    { id: 4, name: "Zone D (East Harbor)", code: "D", isOffice: false, x: 680, y: 300, wasteCapacityKg: 510, binType: "Industrial" },
    { id: 5, name: "Zone E (Tech Park)", code: "E", isOffice: false, x: 580, y: 430, wasteCapacityKg: 380, binType: "Commercial" },
    { id: 6, name: "Zone F (South Suburb)", code: "F", isOffice: false, x: 410, y: 450, wasteCapacityKg: 490, binType: "Residential" },
    { id: 7, name: "Zone G (Hospital Area)", code: "G", isOffice: false, x: 260, y: 410, wasteCapacityKg: 310, binType: "Medical" }
  ],
  distanceMatrix: [
    [0, 6, 9, 14, 16, 13, 8, 5],
    [6, 0, 5, 11, 15, 14, 10, 7],
    [9, 5, 0, 7, 10, 11, 9, 8],
    [14, 11, 7, 0, 6, 8, 12, 13],
    [16, 15, 10, 6, 0, 6, 11, 14],
    [13, 14, 11, 8, 6, 0, 5, 9],
    [8, 10, 9, 12, 11, 5, 0, 4],
    [5, 7, 8, 13, 14, 9, 4, 0]
  ]
};

export function generateRandomGraph(nodeCount = 6, canvasWidth = 800, canvasHeight = 550) {
  const count = Math.max(3, Math.min(12, nodeCount));
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const binTypes = ['Organic', 'Recyclable', 'Commercial', 'General', 'Electronic', 'Hazardous'];

  const locations = [];
  const padding = 70;

  locations.push({
    id: 0,
    name: "Municipal Office",
    code: "O",
    isOffice: true,
    x: padding + Math.floor(Math.random() * 50),
    y: Math.floor(canvasHeight / 2) + Math.floor((Math.random() - 0.5) * 60),
    wasteCapacityKg: 0,
    binType: "Depot"
  });

  const centerX = canvasWidth * 0.55;
  const centerY = canvasHeight * 0.5;
  const radiusX = canvasWidth * 0.35;
  const radiusY = canvasHeight * 0.35;

  for (let i = 1; i < count; i++) {
    const angle = ((i - 1) / (count - 1)) * (2 * Math.PI) - (Math.PI / 2) + ((Math.random() - 0.5) * 0.3);
    const rVarX = radiusX * (0.75 + Math.random() * 0.35);
    const rVarY = radiusY * (0.75 + Math.random() * 0.35);

    const x = Math.round(Math.max(padding, Math.min(canvasWidth - padding, centerX + rVarX * Math.cos(angle))));
    const y = Math.round(Math.max(padding, Math.min(canvasHeight - padding, centerY + rVarY * Math.sin(angle))));

    locations.push({
      id: i,
      name: `Point ${letters[i - 1] || i}`,
      code: letters[i - 1] || `${i}`,
      isOffice: false,
      x,
      y,
      wasteCapacityKg: Math.floor(200 + Math.random() * 600),
      binType: binTypes[(i - 1) % binTypes.length]
    });
  }

  const distanceMatrix = Array.from({ length: count }, () => Array(count).fill(0));

  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const dx = locations[i].x - locations[j].x;
      const dy = locations[i].y - locations[j].y;
      const euclidean = Math.sqrt(dx * dx + dy * dy);
      const roadFactor = 1.05 + Math.random() * 0.25;
      const km = Math.max(2, Math.round((euclidean / 28) * roadFactor));

      distanceMatrix[i][j] = km;
      distanceMatrix[j][i] = km;
    }
  }

  return {
    name: `Custom Random Ward (${count} Locations)`,
    description: `Procedurally generated ${count}-node urban collection sector.`,
    locations,
    distanceMatrix
  };
}

export function validateGraph(locations, distanceMatrix) {
  if (!Array.isArray(locations) || locations.length < 3) {
    return {
      isValid: false,
      error: "Graph must have at least 3 locations (Municipal Office + at least 2 garbage collection points)."
    };
  }

  const n = locations.length;

  if (!Array.isArray(distanceMatrix) || distanceMatrix.length !== n) {
    return {
      isValid: false,
      error: `Distance matrix must be an ${n}x${n} 2D array matching the number of locations.`
    };
  }

  const names = new Set();
  for (let i = 0; i < n; i++) {
    const locName = typeof locations[i] === 'string' ? locations[i] : (locations[i].name || '');
    if (!locName || locName.trim() === '') {
      return { isValid: false, error: `Location at index ${i} has an empty or invalid name.` };
    }
    if (names.has(locName.trim().toLowerCase())) {
      return { isValid: false, error: `Duplicate location name found: "${locName}". Each location must be unique.` };
    }
    names.add(locName.trim().toLowerCase());
  }

  for (let i = 0; i < n; i++) {
    if (!Array.isArray(distanceMatrix[i]) || distanceMatrix[i].length !== n) {
      return { isValid: false, error: `Row ${i} of distance matrix is not of length ${n}.` };
    }

    for (let j = 0; j < n; j++) {
      const val = Number(distanceMatrix[i][j]);

      if (isNaN(val)) {
        return { isValid: false, error: `Invalid non-numeric distance at [${i}, ${j}].` };
      }

      if (i === j && val !== 0) {
        return { isValid: false, error: `Distance from location ${i} to itself must be 0 (found ${val}).` };
      }

      if (i !== j && val <= 0) {
        return {
          isValid: false,
          error: `Distance between location ${i} and ${j} must be a positive number (> 0 km). Found ${val}.`
        };
      }
    }
  }

  return { isValid: true, error: null };
}
