import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Shield,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  BatteryMedium,
  BatteryCharging,
  Phone,
  ExternalLink,
  Sliders,
  Layers,
  ZoomIn,
  ZoomOut,
  Home,
  History,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../services/api';
import { PatientLocation, LocationBreadcrumb, User } from '../../types';

interface PatientLocationTrackingProps {
  patient: User | null;
  onRefreshPatient?: () => void;
}

export const PatientLocationTracking: React.FC<PatientLocationTrackingProps> = ({
  patient,
  onRefreshPatient,
}) => {
  const { t } = useAccessibility();

  const [location, setLocation] = useState<PatientLocation | null>(patient?.location || null);
  const [history, setHistory] = useState<LocationBreadcrumb[]>(patient?.locationHistory || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [isSavingGeofence, setIsSavingGeofence] = useState<boolean>(false);
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const [zoomLevel, setZoomLevel] = useState<number>(16);
  const [safeZoneRadius, setSafeZoneRadius] = useState<number>(
    patient?.location?.safeZoneRadiusMeters || 250
  );
  const [customHomeAddress, setCustomHomeAddress] = useState<string>(
    patient?.location?.homeAddress || '42 Meadowbrook Lane, Maplewood, NJ 07040'
  );
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  // Fetch fresh location on mount or when patient changes
  useEffect(() => {
    if (!patient?._id) return;
    loadLocationData(patient._id);
  }, [patient?._id]);

  const loadLocationData = async (patientId: string) => {
    try {
      setIsLoading(true);
      const res = await api.getPatientLocation(patientId);
      if (res.location) {
        setLocation(res.location);
        setSafeZoneRadius(res.location.safeZoneRadiusMeters || 250);
        if (res.location.homeAddress) {
          setCustomHomeAddress(res.location.homeAddress);
        }
      }
      if (res.locationHistory) {
        setHistory(res.locationHistory);
      }
    } catch (err) {
      console.error('Error fetching patient location:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePingDevice = async () => {
    if (!patient?._id) return;
    try {
      setIsPinging(true);
      const res = await api.pingPatientLocation(patient._id);
      setLocation(res.location);
      setHistory(res.locationHistory);
      setNotificationBanner(t('pushedFreshLocation') || 'Fresh GPS coordinates retrieved successfully');
      setTimeout(() => setNotificationBanner(null), 4000);
      if (onRefreshPatient) onRefreshPatient();
    } catch (err) {
      console.error('Ping failed:', err);
    } finally {
      setIsPinging(false);
    }
  };

  const handleUpdateGeofence = async (newRadius: number) => {
    if (!patient?._id) return;
    try {
      setIsSavingGeofence(true);
      setSafeZoneRadius(newRadius);
      const res = await api.updateGeofence(patient._id, {
        safeZoneRadiusMeters: newRadius,
        homeAddress: customHomeAddress,
      });
      setLocation(res.location);
      setNotificationBanner(`Safe Zone perimeter updated to ${newRadius} meters`);
      setTimeout(() => setNotificationBanner(null), 4000);
      if (onRefreshPatient) onRefreshPatient();
    } catch (err) {
      console.error('Geofence update failed:', err);
    } finally {
      setIsSavingGeofence(false);
    }
  };

  // Quick simulation triggers to demonstrate live tracking states
  const handleSimulateLocation = async (scenario: 'home' | 'garden' | 'outside') => {
    if (!patient?._id || !location) return;

    let targetLat = location.homeLatitude;
    let targetLng = location.homeLongitude;
    let targetAddress = location.homeAddress;

    if (scenario === 'garden') {
      // ~90 meters away (inside 250m safe zone)
      targetLat += 0.0007;
      targetLng += 0.0006;
      targetAddress = `Garden & Courtyard Path (~90m from home), ${location.homeAddress}`;
    } else if (scenario === 'outside') {
      // ~450 meters away (outside 250m safe zone)
      targetLat += 0.0035;
      targetLng += 0.0032;
      targetAddress = `Main Street & Elm Ave Junction (~450m from home)`;
    }

    try {
      setIsPinging(true);
      const res = await api.updatePatientLocation(patient._id, {
        latitude: targetLat,
        longitude: targetLng,
        address: targetAddress,
        accuracy: 5,
        batteryLevel: Math.max(20, (location.batteryLevel || 85) - 2),
      });
      setLocation(res.location);
      setHistory(res.locationHistory);
      if (scenario === 'outside') {
        setNotificationBanner(`🚨 Wandering Alert simulated: Patient moved outside safe perimeter!`);
      } else {
        setNotificationBanner(`Simulated position updated: ${targetAddress}`);
      }
      setTimeout(() => setNotificationBanner(null), 5000);
      if (onRefreshPatient) onRefreshPatient();
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsPinging(false);
    }
  };

  if (isLoading && !location) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-xs">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
        <p className="text-slate-600 font-semibold">{t('loading') || 'Loading patient location telemetry...'}</p>
      </div>
    );
  }

  const currentLoc = location || {
    latitude: 40.7306,
    longitude: -74.2691,
    address: '42 Meadowbrook Lane, Maplewood, NJ',
    accuracy: 6,
    batteryLevel: 86,
    status: 'at_home' as const,
    lastUpdated: new Date().toISOString(),
    homeLatitude: 40.7306,
    homeLongitude: -74.2691,
    homeAddress: '42 Meadowbrook Lane, Maplewood, NJ',
    safeZoneRadiusMeters: 250,
  };

  const isAlert = currentLoc.status === 'wandering_alert';
  const isSafe = !isAlert;

  // Google Maps links
  const googleMapsUrl = `https://www.google.com/maps?q=${currentLoc.latitude},${currentLoc.longitude}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${currentLoc.latitude},${currentLoc.longitude}`;

  // Calculate distance between patient and home in meters
  const latDiff = (currentLoc.latitude - currentLoc.homeLatitude) * 111320;
  const lngDiff =
    (currentLoc.longitude - currentLoc.homeLongitude) *
    (40075000 * Math.cos((currentLoc.homeLatitude * Math.PI) / 180)) /
    360;
  const distanceMeters = Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff));

  // Map canvas coordinate mapping
  // Map container is 600 x 400. Center is (300, 200) representing home location.
  // Scale: at zoomLevel 16, 500 meters is roughly 180px.
  const scalePixelsPerMeter = (zoomLevel / 16) * 0.45;
  const homeX = 300;
  const homeY = 200;
  const patientX = Math.min(570, Math.max(30, homeX + lngDiff * scalePixelsPerMeter));
  const patientY = Math.min(370, Math.max(30, homeY - latDiff * scalePixelsPerMeter));
  const radiusPixels = Math.max(20, safeZoneRadius * scalePixelsPerMeter);

  return (
    <div className="space-y-6" id="patient-location-tracking-container">
      {/* Real-time Notification Banner */}
      {notificationBanner && (
        <div
          id="location-notification-banner"
          className={`p-4 rounded-xl font-bold flex items-center justify-between text-sm sm:text-base border shadow-sm transition-all ${
            notificationBanner.includes('🚨')
              ? 'bg-rose-50 text-rose-900 border-rose-300 animate-bounce'
              : 'bg-indigo-50 text-indigo-900 border-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>{notificationBanner}</span>
          </div>
          <button
            onClick={() => setNotificationBanner(null)}
            className="text-xs uppercase tracking-wider font-extrabold hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Safe Zone Status Header */}
      <div
        id="safe-zone-status-card"
        className={`p-5 sm:p-6 rounded-2xl border transition-all ${
          isAlert
            ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-md'
            : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-emerald-200 text-slate-900 shadow-xs'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`p-3.5 rounded-2xl shrink-0 ${
                isAlert ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-600 text-white'
              }`}
            >
              {isAlert ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                  {isAlert ? t('outsideSafeZone') || 'Outside Safe Zone — Wandering Alert' : t('insideSafeZone') || 'Inside Safe Zone — Safe at Home'}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    isAlert
                      ? 'bg-rose-600 text-white'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {isAlert ? '🚨 Urgent Alert' : '🟢 Monitored Safe'}
                </span>
              </div>
              <p className="text-sm text-slate-600 font-medium">
                {isAlert
                  ? `${patient?.name || 'Patient'} is ${distanceMeters}m away from home, exceeding the ${safeZoneRadius}m safe perimeter.`
                  : `${patient?.name || 'Patient'} is within ${distanceMeters}m of the safe home residence (${safeZoneRadius}m radius allowed).`}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {currentLoc.address}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {t('lastLocationUpdate') || 'Updated'}: {new Date(currentLoc.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <button
              id="btn-ping-device"
              onClick={handlePingDevice}
              disabled={isPinging}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl font-bold text-sm shadow-xs flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-600 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'Pinging Device...' : t('pingLocationNow') || 'Ping Device Now'}</span>
            </button>

            <a
              id="btn-open-google-maps"
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Navigation className="w-4 h-4 text-white" />
              <span>{t('viewOnGoogleMaps') || 'Open Google Maps'}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <a
              id="btn-get-directions"
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Compass className="w-4 h-4 text-white" />
              <span>{t('getDirections') || 'Get Directions'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map & Telemetry Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Map Canvas */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          {/* Map Controls Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-white rounded-lg border border-slate-200 text-indigo-600 shadow-2xs">
                <MapPin className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-black text-slate-900 text-sm">{t('liveLocation') || 'Live Location Radar'}</h4>
                <p className="text-[11px] font-semibold text-slate-500">
                  {currentLoc.latitude.toFixed(6)}, {currentLoc.longitude.toFixed(6)} • ±{currentLoc.accuracy || 6}m GPS Accuracy
                </p>
              </div>
            </div>

            {/* Map Controls */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setMapType(mapType === 'street' ? 'satellite' : 'street')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  mapType === 'street' ? 'bg-indigo-50 text-indigo-700 font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Toggle Street / Satellite layout view"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{mapType === 'street' ? 'Street' : 'Satellite'}</span>
              </button>

              <div className="w-px h-4 bg-slate-200 mx-0.5" />

              <button
                onClick={() => setZoomLevel((z) => Math.min(20, z + 1))}
                className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(12, z - 1))}
                className="p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(16)}
                className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 cursor-pointer"
                title="Reset Zoom"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Interactive Map Canvas Container */}
          <div
            id="map-canvas-container"
            className={`relative h-[380px] sm:h-[440px] w-full select-none overflow-hidden ${
              mapType === 'satellite'
                ? 'bg-slate-900 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]'
                : 'bg-slate-100 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]'
            }`}
          >
            {/* Street Grid Lines / Satellite Texture */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke={mapType === 'satellite' ? '#334155' : '#e2e8f0'} strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Roads simulation */}
              <line x1="0" y1="200" x2="100%" y2="200" stroke={mapType === 'satellite' ? '#475569' : '#cbd5e1'} strokeWidth="16" />
              <line x1="300" y1="0" x2="300" y2="100%" stroke={mapType === 'satellite' ? '#475569' : '#cbd5e1'} strokeWidth="14" />
              <line x1="120" y1="0" x2="120" y2="100%" stroke={mapType === 'satellite' ? '#334155' : '#e2e8f0'} strokeWidth="8" />
              <line x1="480" y1="0" x2="480" y2="100%" stroke={mapType === 'satellite' ? '#334155' : '#e2e8f0'} strokeWidth="8" />
            </svg>

            {/* Safe Geofence Zone Circle (Centered on Home) */}
            <div
              className={`absolute rounded-full pointer-events-none transition-all duration-500 border-2 ${
                isAlert
                  ? 'border-dashed border-rose-400/80 bg-rose-500/10'
                  : 'border-emerald-500/70 bg-emerald-500/15'
              }`}
              style={{
                left: `${homeX - radiusPixels}px`,
                top: `${homeY - radiusPixels}px`,
                width: `${radiusPixels * 2}px`,
                height: `${radiusPixels * 2}px`,
              }}
            >
              {/* Geofence safe zone label */}
              <span
                className={`absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs whitespace-nowrap ${
                  isAlert ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                Safe Perimeter ({safeZoneRadius}m)
              </span>
            </div>

            {/* Distance line connecting Home and Patient if away */}
            {distanceMeters > 20 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line
                  x1={homeX}
                  y1={homeY}
                  x2={patientX}
                  y2={patientY}
                  stroke={isAlert ? '#e11d48' : '#059669'}
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
              </svg>
            )}

            {/* Home Marker */}
            <div
              id="marker-home-residence"
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto cursor-pointer group z-10"
              style={{ left: `${homeX}px`, top: `${homeY}px` }}
            >
              <div className="p-2.5 rounded-full bg-slate-900 text-white shadow-lg border-2 border-white ring-2 ring-slate-900/20 group-hover:scale-110 transition-transform">
                <Home className="w-5 h-5 text-amber-300" />
              </div>
              <div className="mt-1 px-2 py-0.5 bg-slate-900/90 text-white rounded text-[10px] font-bold shadow whitespace-nowrap">
                🏠 Safe Home
              </div>
            </div>

            {/* Patient Pin Marker with Pulse */}
            <div
              id="marker-patient-current"
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto cursor-pointer group z-20 transition-all duration-700"
              style={{ left: `${patientX}px`, top: `${patientY}px` }}
            >
              {/* Pulsing Beacon */}
              <div
                className={`absolute w-14 h-14 rounded-full animate-ping pointer-events-none ${
                  isAlert ? 'bg-rose-500/50' : 'bg-indigo-500/40'
                }`}
              />

              {/* Pin badge with patient avatar or initial */}
              <div
                className={`relative p-1 rounded-full shadow-xl border-3 group-hover:scale-110 transition-transform ${
                  isAlert ? 'border-rose-600 bg-rose-50' : 'border-indigo-600 bg-indigo-50'
                }`}
              >
                {patient?.avatar ? (
                  <img
                    src={patient.avatar}
                    alt={patient.name}
                    className="w-9 h-9 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-sm">
                    {patient?.name?.charAt(0) || 'P'}
                  </div>
                )}
                <span
                  className={`absolute -bottom-1 -right-1 p-0.5 rounded-full text-white ${
                    isAlert ? 'bg-rose-600 animate-bounce' : 'bg-emerald-600'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                </span>
              </div>

              <div
                className={`mt-1 px-2 py-0.5 rounded text-[11px] font-black shadow-md whitespace-nowrap ${
                  isAlert ? 'bg-rose-600 text-white' : 'bg-indigo-950 text-white'
                }`}
              >
                {patient?.name || 'Patient'} ({distanceMeters}m from home)
              </div>
            </div>

            {/* Bottom-left Map legend */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-md text-xs font-semibold text-slate-700 flex flex-col gap-1.5 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-900 inline-block border border-white" />
                <span>Home Residence</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full inline-block border border-white ${
                    isAlert ? 'bg-rose-600' : 'bg-indigo-600'
                  }`}
                />
                <span>Current Patient GPS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-dashed border-emerald-500 bg-emerald-500/20 inline-block" />
                <span>{safeZoneRadius}m Geofence</span>
              </div>
            </div>

            {/* Bottom-right Google Maps quick launcher pill */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 bg-white hover:bg-slate-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-slate-300 shadow-md text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
              <span>Full Google Maps View</span>
            </a>
          </div>

          {/* Location Verification & Simulation Controls (for caregiver testing) */}
          <div className="p-3.5 bg-slate-50/80 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-600 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-indigo-600" />
              Test Tracking Scenarios:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                id="btn-sim-home"
                onClick={() => handleSimulateLocation('home')}
                disabled={isPinging}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold cursor-pointer transition-colors"
              >
                🏠 Patient At Home
              </button>
              <button
                id="btn-sim-garden"
                onClick={() => handleSimulateLocation('garden')}
                disabled={isPinging}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold cursor-pointer transition-colors"
              >
                🌳 Garden Walk (~90m)
              </button>
              <button
                id="btn-sim-outside"
                onClick={() => handleSimulateLocation('outside')}
                disabled={isPinging}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-lg font-black cursor-pointer transition-colors"
              >
                🚨 Simulate Wandering (~450m)
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Geofence Settings & Safety Telemetry */}
        <div className="space-y-6">
          {/* Device & Battery Telemetry Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Patient Device Telemetry</span>
            </h4>

            <div className="space-y-3">
              {/* Battery Level */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      (currentLoc.batteryLevel || 86) > 25
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700 animate-pulse'
                    }`}
                  >
                    <BatteryCharging className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500">{t('deviceBattery') || 'Battery Level'}</div>
                    <div className="font-black text-slate-900 text-base">
                      {currentLoc.batteryLevel || 86}%
                    </div>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-20 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      (currentLoc.batteryLevel || 86) > 25 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${currentLoc.batteryLevel || 86}%` }}
                  />
                </div>
              </div>

              {/* GPS Accuracy */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500">{t('gpsAccuracy') || 'GPS Accuracy'}</div>
                    <div className="font-black text-slate-900 text-base">
                      ±{currentLoc.accuracy || 6} meters
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  High Precision
                </span>
              </div>

              {/* Emergency Contact */}
              {patient?.emergencyContact && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 mb-1">
                    Primary Emergency Contact
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-slate-900 text-sm">
                        {patient.emergencyContact.name} ({patient.emergencyContact.relation})
                      </div>
                      <div className="text-xs font-semibold text-slate-600">
                        {patient.emergencyContact.phone}
                      </div>
                    </div>
                    <a
                      href={`tel:${patient.emergencyContact.phone}`}
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                      title="Call Emergency Contact"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Safe Zone Geofence Configuration Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>{t('safeZoneRadius') || 'Safe Geofence Perimeter'}</span>
              </h4>
              <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                {safeZoneRadius}m Active
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              If the patient moves beyond this distance from the registered home address, the system automatically marks a Wandering Alert and notifies the caregiver.
            </p>

            {/* Radius Preset Buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {[100, 250, 500, 1000].map((radius) => (
                <button
                  key={radius}
                  onClick={() => handleUpdateGeofence(radius)}
                  disabled={isSavingGeofence}
                  className={`py-2 px-1 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                    safeZoneRadius === radius
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}
                </button>
              ))}
            </div>

            {/* Registered Safe Home Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-slate-400" />
                <span>Safe Home Residence</span>
              </label>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
                {currentLoc.homeAddress}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Breadcrumbs History */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <History className="w-4 h-4" />
            </span>
            <div>
              <h4 className="font-black text-slate-900 text-base">
                {t('recentLocationHistory') || 'Recent Location Breadcrumbs & Check-ins'}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Automatic audit trail of location check-ins and safe zone status changes
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {history.length} recorded events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold">
                <th className="pb-2.5">Time</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Location & Address</th>
                <th className="pb-2.5 text-right">Coordinates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((item, idx) => (
                <tr key={item._id || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 font-semibold text-slate-600 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        item.status === 'wandering_alert'
                          ? 'bg-rose-100 text-rose-800'
                          : item.status === 'safe_zone'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.status === 'wandering_alert' ? (
                        <>
                          <AlertTriangle className="w-3 h-3" /> Wandering Alert
                        </>
                      ) : item.status === 'safe_zone' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Safe Zone
                        </>
                      ) : (
                        <>
                          <Home className="w-3 h-3" /> At Home
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 font-medium text-slate-800 max-w-xs truncate">
                    {item.address}
                  </td>
                  <td className="py-3 text-right font-mono text-xs text-slate-500 whitespace-nowrap">
                    {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
