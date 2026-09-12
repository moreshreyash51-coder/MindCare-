import express, { Request, Response } from 'express';
import { db, IPatientLocation, ILocationBreadcrumb } from '../db/schema.js';

export const patientsRouter = express.Router();

// GET /api/patients
patientsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const patients = await db.users.find({ role: 'patient' });
    const safePatients = patients.map(({ password: _, ...p }) => p);
    res.json(safePatients);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// GET /api/patients/:id
patientsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const patient = await db.users.findById(req.params.id);
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }
    const { password: _, ...patientSafe } = patient;
    res.json(patientSafe);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve patient details' });
  }
});

// PUT /api/patients/:id
patientsRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, gender, avatar, emergencyContact, accessibilitySettings, language, cognitiveDifficulty } = req.body;
    const existing = await db.users.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    const updated = await db.users.findByIdAndUpdate(req.params.id, {
      ...(name ? { name } : {}),
      ...(gender ? { gender } : {}),
      ...(avatar ? { avatar } : {}),
      ...(emergencyContact ? { emergencyContact } : {}),
      ...(accessibilitySettings ? { accessibilitySettings } : {}),
      ...(language ? { language } : {}),
      ...(cognitiveDifficulty ? { cognitiveDifficulty } : {}),
    });

    if (!updated) {
      res.status(404).json({ error: 'Update failed' });
      return;
    }

    const { password: _, ...patientSafe } = updated;
    res.json({ message: 'Patient profile updated', patient: patientSafe });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update patient profile' });
  }
});

// Helper: Haversine distance in meters
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// GET /api/patients/:id/location
patientsRouter.get('/:id/location', async (req: Request, res: Response): Promise<void> => {
  try {
    const patient = await db.users.findById(req.params.id);
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    // If location is not yet set, initialize with sensible defaults
    const isArthur = patient._id === 'patient_arthur' || patient.name.toLowerCase().includes('arthur');
    const defaultHome = isArthur
      ? {
          latitude: 42.5878,
          longitude: -72.6001,
          address: '15 Oak Ridge Road, Greenfield, MA 01301',
          homeLatitude: 42.5878,
          homeLongitude: -72.6001,
          homeAddress: '15 Oak Ridge Road, Greenfield, MA 01301',
        }
      : {
          latitude: 40.7306,
          longitude: -74.2691,
          address: '42 Meadowbrook Lane, Maplewood, NJ 07040',
          homeLatitude: 40.7306,
          homeLongitude: -74.2691,
          homeAddress: '42 Meadowbrook Lane, Maplewood, NJ 07040',
        };

    const location = patient.location || {
      latitude: defaultHome.latitude,
      longitude: defaultHome.longitude,
      address: defaultHome.address,
      accuracy: 6,
      batteryLevel: 88,
      status: 'at_home' as const,
      lastUpdated: new Date().toISOString(),
      homeLatitude: defaultHome.homeLatitude,
      homeLongitude: defaultHome.homeLongitude,
      homeAddress: defaultHome.homeAddress,
      safeZoneRadiusMeters: 250,
    };

    const locationHistory = patient.locationHistory || [
      {
        _id: 'loc_init_1',
        patientId: patient._id,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        status: location.status,
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      },
    ];

    res.json({
      patientId: patient._id,
      patientName: patient.name,
      emergencyContact: patient.emergencyContact,
      location,
      locationHistory,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve patient location' });
  }
});

// POST /api/patients/:id/location (Update live GPS coordinates)
patientsRouter.post('/:id/location', async (req: Request, res: Response): Promise<void> => {
  try {
    const patient = await db.users.findById(req.params.id);
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    const { latitude, longitude, address, accuracy, batteryLevel } = req.body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      res.status(400).json({ error: 'latitude and longitude must be numbers' });
      return;
    }

    const currentLocation: IPatientLocation = patient.location || {
      homeLatitude: latitude,
      homeLongitude: longitude,
      homeAddress: address || 'Registered Safe Residence',
      safeZoneRadiusMeters: 250,
      status: 'at_home' as const,
      latitude,
      longitude,
      address: address || 'Registered Safe Residence',
      accuracy: 8,
      batteryLevel: 85,
      lastUpdated: new Date().toISOString(),
    };

    const homeLat = currentLocation.homeLatitude ?? latitude;
    const homeLng = currentLocation.homeLongitude ?? longitude;
    const safeRadius = currentLocation.safeZoneRadiusMeters || 250;

    const distanceFromHome = calculateDistanceMeters(latitude, longitude, homeLat, homeLng);

    let status: IPatientLocation['status'] = 'at_home';
    if (distanceFromHome <= 60) {
      status = 'at_home';
    } else if (distanceFromHome <= safeRadius) {
      status = 'safe_zone';
    } else {
      status = 'wandering_alert';
    }

    const resolvedAddress = address || (status === 'at_home' ? currentLocation.homeAddress : `Near coordinate ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);

    const updatedLocation: IPatientLocation = {
      latitude,
      longitude,
      address: resolvedAddress,
      accuracy: typeof accuracy === 'number' ? accuracy : 8,
      batteryLevel: typeof batteryLevel === 'number' ? batteryLevel : (currentLocation.batteryLevel ?? 85),
      status,
      lastUpdated: new Date().toISOString(),
      homeLatitude: homeLat,
      homeLongitude: homeLng,
      homeAddress: currentLocation.homeAddress || 'Registered Safe Residence',
      safeZoneRadiusMeters: safeRadius,
    };

    // If wandering alert detected, push urgent notification for caregiver
    if (status === 'wandering_alert') {
      const caregivers = await db.users.find({ role: 'caregiver', patientId: patient._id });
      const caregiverId = caregivers[0]?._id;

      await db.notifications.create({
        patientId: patient._id,
        caregiverId,
        title: '🚨 Patient Wandering Alert',
        message: `${patient.name} has moved outside the ${safeRadius}m safe zone (~${Math.round(distanceFromHome)}m away). Location: ${resolvedAddress}`,
        type: 'wandering_alert',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    const newBreadcrumb = {
      _id: 'loc_' + Date.now().toString(36),
      patientId: patient._id,
      latitude,
      longitude,
      address: resolvedAddress,
      status,
      timestamp: new Date().toISOString(),
    };

    const existingHistory = patient.locationHistory || [];
    const updatedHistory = [newBreadcrumb, ...existingHistory].slice(0, 20);

    await db.users.findByIdAndUpdate(patient._id, {
      location: updatedLocation,
      locationHistory: updatedHistory,
    });

    res.json({
      message: 'Location updated successfully',
      location: updatedLocation,
      locationHistory: updatedHistory,
      distanceFromHomeMeters: Math.round(distanceFromHome),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update patient location' });
  }
});

// PUT /api/patients/:id/location/geofence (Adjust safe zone radius or home position)
patientsRouter.put('/:id/location/geofence', async (req: Request, res: Response): Promise<void> => {
  try {
    const patient = await db.users.findById(req.params.id);
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    const { safeZoneRadiusMeters, homeLatitude, homeLongitude, homeAddress } = req.body;

    const currentLoc = patient.location || {
      latitude: 40.7306,
      longitude: -74.2691,
      address: 'Registered Home Residence',
      accuracy: 6,
      batteryLevel: 88,
      status: 'at_home',
      lastUpdated: new Date().toISOString(),
      homeLatitude: 40.7306,
      homeLongitude: -74.2691,
      homeAddress: 'Registered Home Residence',
      safeZoneRadiusMeters: 250,
    };

    const newHomeLat = typeof homeLatitude === 'number' ? homeLatitude : currentLoc.homeLatitude;
    const newHomeLng = typeof homeLongitude === 'number' ? homeLongitude : currentLoc.homeLongitude;
    const newRadius = typeof safeZoneRadiusMeters === 'number' ? safeZoneRadiusMeters : currentLoc.safeZoneRadiusMeters;
    const newHomeAddress = homeAddress || currentLoc.homeAddress;

    const dist = calculateDistanceMeters(currentLoc.latitude, currentLoc.longitude, newHomeLat, newHomeLng);
    const newStatus: IPatientLocation['status'] = dist <= 60 ? 'at_home' : dist <= newRadius ? 'safe_zone' : 'wandering_alert';

    const updatedLocation: IPatientLocation = {
      ...currentLoc,
      homeLatitude: newHomeLat,
      homeLongitude: newHomeLng,
      homeAddress: newHomeAddress,
      safeZoneRadiusMeters: newRadius,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    };

    await db.users.findByIdAndUpdate(patient._id, {
      location: updatedLocation,
    });

    res.json({
      message: 'Geofence settings updated',
      location: updatedLocation,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update geofence' });
  }
});

// POST /api/patients/:id/location/ping (Trigger fresh GPS check)
patientsRouter.post('/:id/location/ping', async (req: Request, res: Response): Promise<void> => {
  try {
    const patient = await db.users.findById(req.params.id);
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    const currentLoc = patient.location;
    if (!currentLoc) {
      res.status(404).json({ error: 'No location profile registered for patient' });
      return;
    }

    // Refresh ping timestamp and slight jitter to simulate live GPS ping
    const jitterLat = (Math.random() - 0.5) * 0.0001;
    const jitterLng = (Math.random() - 0.5) * 0.0001;

    const newLat = currentLoc.latitude + jitterLat;
    const newLng = currentLoc.longitude + jitterLng;
    const dist = calculateDistanceMeters(newLat, newLng, currentLoc.homeLatitude, currentLoc.homeLongitude);
    const status: IPatientLocation['status'] = dist <= 60 ? 'at_home' : dist <= currentLoc.safeZoneRadiusMeters ? 'safe_zone' : 'wandering_alert';

    const refreshedLoc: IPatientLocation = {
      ...currentLoc,
      latitude: Number(newLat.toFixed(6)),
      longitude: Number(newLng.toFixed(6)),
      status,
      batteryLevel: Math.max(15, (currentLoc.batteryLevel || 85) - (Math.random() > 0.8 ? 1 : 0)),
      lastUpdated: new Date().toISOString(),
    };

    const newBreadcrumb: ILocationBreadcrumb = {
      _id: 'loc_' + Date.now().toString(36),
      patientId: patient._id,
      latitude: refreshedLoc.latitude,
      longitude: refreshedLoc.longitude,
      address: refreshedLoc.address,
      status,
      timestamp: refreshedLoc.lastUpdated,
    };

    const existingHistory = patient.locationHistory || [];
    const updatedHistory = [newBreadcrumb, ...existingHistory].slice(0, 20);

    await db.users.findByIdAndUpdate(patient._id, {
      location: refreshedLoc,
      locationHistory: updatedHistory,
    });

    res.json({
      message: 'Ping successful',
      location: refreshedLoc,
      locationHistory: updatedHistory,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to ping patient device' });
  }
});
