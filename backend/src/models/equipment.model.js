/**
 * Equipment Model
 */

export class Equipment {
  constructor({
    id,
    name,
    category,
    departmentId,
    departmentName,
    manufacturer = '',
    modelNumber = '',
    status = 'available',
    dailyRate = 500,
    hourlyRate = 50,
    rating = 4.8,
    reviewsCount = 10,
    imageUrl = '',
    description = '',
    features = [],
    specifications = {},
    location = 'Main Clinical Tower',
    complianceCertifications = ['FDA', 'CE'],
    operatorRequired = false
  }) {
    this.id = id || 'eq_' + Math.random().toString(36).substring(2, 9);
    this.name = name;
    this.category = category;
    this.departmentId = departmentId;
    this.departmentName = departmentName;
    this.manufacturer = manufacturer;
    this.modelNumber = modelNumber;
    this.status = status;
    this.dailyRate = dailyRate;
    this.hourlyRate = hourlyRate;
    this.rating = rating;
    this.reviewsCount = reviewsCount;
    this.imageUrl = imageUrl;
    this.description = description;
    this.features = features;
    this.specifications = specifications;
    this.location = location;
    this.complianceCertifications = complianceCertifications;
    this.operatorRequired = operatorRequired;
    this.updatedAt = new Date().toISOString();
  }
}

export const inMemoryEquipment = [
  new Equipment({
    id: 'eq-mri-3t',
    name: '3.0 Tesla High-Field MRI Scanner',
    category: 'Radiology & Imaging',
    departmentId: 'radiology',
    departmentName: 'Diagnostic Radiology & Advanced Neuroimaging',
    manufacturer: 'Siemens Healthineers',
    modelNumber: 'MAGNETOM Vida 3T',
    status: 'available',
    dailyRate: 1850,
    hourlyRate: 195,
    rating: 4.9,
    reviewsCount: 38,
    imageUrl: '/hospital/mri_scanner_suite.jpg',
    description: 'Ultra-high-field multi-channel clinical MRI with Biomatrix sensors, enabling sub-millimeter deep brain structural mapping and non-invasive cardiovascular angiograms.',
    features: ['64-Channel Neuro Suite', 'Zero-Helium Boiloff Cryogenics', 'WhisperQuiet Acoustic Shielding'],
    specifications: {
      'Bore Diameter': '70 cm',
      'Field Strength': '3.0 Tesla',
      'Patient Weight Limit': '250 kg'
    },
    location: 'Diagnostic Wing, Level -1 (Shielded Suite A)',
    operatorRequired: true
  }),
  new Equipment({
    id: 'eq-cardiac-or',
    name: 'Endovascular Hybrid Robotic Operating Suite',
    category: 'Surgical Robotics',
    departmentId: 'cardiology',
    departmentName: 'Cardiovascular Surgery & Electrophysiology',
    manufacturer: 'Intuitive / Philips Healthcare',
    modelNumber: 'AlluraClarity Hybrid Angio-OR',
    status: 'available',
    dailyRate: 3200,
    hourlyRate: 350,
    rating: 5.0,
    reviewsCount: 42,
    imageUrl: '/hospital/cardiac_or.jpg',
    description: 'Robotic high-throughput surgical intervention theater equipped with multi-axis C-arm fluoroscopy, intravascular ultrasound, and laminar airflow sterilization.',
    features: ['Stereotactic Navigational Mapping', 'Direct 3D CT Reconstruction', 'Real-time Hemodynamic Telemetry'],
    specifications: {
      'Generator Power': '100 kW High Frequency',
      'Air Change Rate': '32 ACPH'
    },
    location: 'Surgical Pavilion, Tower B, Suite 402',
    operatorRequired: true
  }),
  new Equipment({
    id: 'eq-laparoscopic-robot',
    name: 'Da Vinci Xi Surgical Tele-manipulator System',
    category: 'Minimally Invasive Surgery',
    departmentId: 'general-surgery',
    departmentName: 'Minimally Invasive & General Surgery',
    manufacturer: 'Intuitive Surgical',
    modelNumber: 'IS4000 DaVinci Xi',
    status: 'available',
    dailyRate: 2750,
    hourlyRate: 290,
    rating: 4.8,
    reviewsCount: 29,
    imageUrl: '/hospital/or_sterile_clean.jpg',
    description: 'Quad-arm multi-quadrant robotic console offering 7 degrees of freedom, tremor filtration, and 3D-HD magnified stereoscopic visualization for micro-dissection.',
    features: ['Firefly Fluorescence Imaging', 'Integrated EndoWrist Instruments', 'Dual Console Teaching Capability'],
    specifications: {
      'Vision System': 'Dual 3-Chip HD 1080p Endo-cameras',
      'Motion Scaling': '3:1 and 5:1 Micro-translation'
    },
    location: 'Central Surgical Wing, OR 7',
    operatorRequired: true
  }),
  new Equipment({
    id: 'eq-portable-ultrasound',
    name: 'Point-of-Care Handheld Ultrasound Array',
    category: 'Bedside Diagnostics',
    departmentId: 'emergency',
    departmentName: 'Emergency Medicine & Critical Care',
    manufacturer: 'Butterfly Network / GE',
    modelNumber: 'Butterfly iQ+ / Vscan Air',
    status: 'available',
    dailyRate: 220,
    hourlyRate: 35,
    rating: 4.7,
    reviewsCount: 54,
    imageUrl: '/hospital/or_adventhealth.jpg',
    description: 'Silicon-on-chip multi-frequency ultrasound probe providing whole-body imaging, needle visualization guidance, and cloud-synchronized DICOM archiving.',
    features: ['Curved, Linear & Phased Array Modes', 'Biopsy Needle Enhancement', 'Wireless iOS/Android Link'],
    specifications: {
      'Frequency Range': '1 MHz to 10 MHz',
      'Battery Runtime': '2.5 continuous scanning hours'
    },
    location: 'Emergency Triage Room 3, Crash Cart #4',
    operatorRequired: false
  })
];

export default Equipment;
