import { LocationResult, requestUserLocation } from "@/lib/requestUserLocation";
import { getDistanceInMeters, isOverDays } from "@/lib/utils";
import {
  X,
  MapPin,
  Navigation,
  AlertCircle,
  Save,
  History,
  Lock,
  Pencil,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getAddressAndDistance } from "../actions/getAddressAndDistance";
import LocationPermissionModal from "./LocationPermissionModal";

export type LocationProps = Pick<LocationResult, "latitude" | "longitude"> & {
  address: string;
  googleAddress: string;
  distance: number;
};

type UpdateAddressModalProps = {
  isVisible: boolean;
  toggleModal: () => void;
  addressLastUpdated?: Date | null;
  currentAddress?: string | null;
  distance: number;
  currentLocation: Pick<LocationResult, "latitude" | "longitude">;
  onSubmit: (location: LocationProps) => void;
  isSubmitting: boolean;
};

const UpdateAddressModal = ({
  isVisible,
  toggleModal,
  addressLastUpdated,
  currentAddress,
  distance,
  currentLocation,
  onSubmit,
  isSubmitting,
}: UpdateAddressModalProps) => {
  const [isLocked, setIsLocked] = useState(false);
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [addressDetails, setAddressDetails] = useState({
    address: currentAddress,
    googleAddress: currentAddress,
    distance: distance,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const init = () => {
      if (addressLastUpdated) {
        const isExpired = isOverDays(addressLastUpdated, 14);
        setIsLocked(!isExpired);
      }
    };
    init();
  }, [addressLastUpdated]);

  useEffect(() => {
    const init = () => {
      setAddressDetails({
        address: currentAddress,
        googleAddress: currentAddress,
        distance: distance,
      });
    };
    init();
  }, [currentAddress, distance]);

  if (!isVisible) return null;

  const getLocation = async () => {
    const result = await requestUserLocation();
    setLocation(result);
    if (result.success && result.latitude && result.longitude) {
      setIsLoading(true);
      const data = await getAddressAndDistance(
        result.latitude,
        result.longitude,
      );
      setIsLoading(false);
      setAddressDetails({
        address: data.address,
        googleAddress: data.address,
        distance: data.distance,
      });
    }
  };

  if (location && !location.success) return <LocationPermissionModal />;

  const closeModal = () => {
    setAddressDetails({
      address: currentAddress,
      googleAddress: currentAddress,
      distance: distance,
    });
    setLocation(null);
    toggleModal();
  };

  const isAddressSame = () => {
    if (!currentLocation || !location) return true;

    const distance = getDistanceInMeters(
      currentLocation.latitude as number,
      currentLocation.longitude as number,
      location.latitude as number,
      location.longitude as number,
    );

    return distance <= 50;
  };

  const submit = () => {
    if (
      addressDetails?.address &&
      addressDetails?.googleAddress &&
      addressDetails?.distance &&
      location
    ) {
      onSubmit({
        address: addressDetails.address,
        googleAddress: addressDetails.googleAddress,
        latitude: location?.latitude,
        longitude: location?.longitude,
        distance: addressDetails.distance,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <button
        onClick={closeModal}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-[#0c0c0c] border border-white/10 rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="h-[3px] bg-gradient-to-r from-[#dc143c] via-[#ff6b81] to-transparent flex-shrink-0" />

        <div className="px-7 pt-6 pb-5 border-b border-white/[0.07] flex items-start justify-between gap-4 flex-shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 mb-3">
              <History className="w-3 h-3 text-neutral-400" />
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Last Updated:{" "}
                {addressLastUpdated
                  ? new Date(addressLastUpdated).toLocaleDateString()
                  : "Never"}
              </span>
            </div>
            <h2 className="text-[22px] font-extrabold text-white tracking-tight leading-tight mb-1">
              Update Address
            </h2>
            <p className="text-xs text-white/30">
              Your address is used to verify service availability and travel
              fees.
            </p>
          </div>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white/20" />
          </button>
        </div>

        <div className="px-7 py-6 space-y-5 overflow-y-auto">
          {location?.success ? (
            <div className="p-4 rounded-2xl border bg-white/[0.02] border-white/[0.07] focus-within:border-[#dc143c]/40 transition-all duration-300">
              <label className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                  Current Location
                </span>
                <span className="text-[9px] text-white/10 font-medium uppercase">
                  {`${addressDetails.address?.length}/250 characters`}
                </span>
              </label>
              <textarea
                rows={3}
                value={addressDetails.address ?? ""}
                onChange={(e) => {
                  setAddressDetails({
                    ...addressDetails,
                    address: e.target.value,
                  });
                }}
                maxLength={250}
                placeholder="Enter your full address..."
                className="w-full bg-transparent text-sm text-white/80 font-medium leading-relaxed outline-none resize-none placeholder:text-white/10"
              />
              <div className="flex justify-end mt-1">
                <Pencil className="w-3 h-3 text-white/10" />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl border bg-white/[0.02] border-white/[0.07]">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">
                Current Registered Location
              </p>
              <p className="text-sm text-white/80 font-medium leading-relaxed">
                {addressDetails.address ?? "No address provided yet."}
              </p>
            </div>
          )}
          {/*  */}

          <button
            onClick={getLocation}
            disabled={isLocked || isLoading}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-300 group
    ${
      isLocked
        ? "border-white/10 bg-white/[0.04] cursor-not-allowed"
        : isLoading
          ? "border-white/20 bg-white/5 cursor-wait"
          : "border-[#dc143c]/30 bg-[#dc143c]/5 hover:bg-[#dc143c]/10 active:scale-[0.98]"
    }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
      ${isLocked ? "bg-white/10 border border-white/5" : "bg-[#dc143c]/20 border border-[#dc143c]/20"}`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <MapPin
                    className={`w-5 h-5 ${isLocked ? "text-white/40" : "text-[#ff6b81] animate-pulse"}`}
                  />
                )}
              </div>

              <div className="text-left">
                <p
                  className={`text-sm font-bold uppercase tracking-wide 
        ${isLocked ? "text-white/40" : isLoading ? "text-white/60" : "text-white"}`}
                >
                  {isLocked
                    ? "Location Locked"
                    : isLoading
                      ? "Finding you..."
                      : "Detect Current Location"}
                </p>

                <p
                  className={`text-[11px] font-medium 
        ${isLocked ? "text-white/20" : isLoading ? "text-[#ff6b81] animate-pulse" : "text-[#ff6b81]/70"}`}
                >
                  {isLocked
                    ? "Cooldown period active"
                    : isLoading
                      ? "Requesting GPS permissions"
                      : "Uses GPS for high accuracy"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center w-4">
              {isLocked ? (
                <Lock className="w-4 h-4 text-white/10" />
              ) : isLoading ? (
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#ff6b81] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#dc143c]"></span>
                </span>
              ) : (
                <Navigation className="w-4 h-4 text-[#ff6b81] group-hover:rotate-45 transition-transform" />
              )}
            </div>
          </button>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-amber-200/60 font-medium">
              <strong className="text-amber-500 uppercase text-[10px] block mb-0.5">
                Note:
              </strong>
              Address changes are restricted to once every 14 days to prevent
              system abuse. Please ensure your GPS signal is strong.
            </p>
          </div>
        </div>

        <div className="px-7 pb-7 pt-4 border-t border-white/[0.07] bg-[#080808]">
          <button
            onClick={() => submit()}
            disabled={isLocked || isAddressSame() || isSubmitting}
            className="w-full group flex items-center justify-center gap-3 h-[56px] bg-[#dc143c] hover:bg-[#c01236] disabled:bg-white/5 disabled:text-white/10 disabled:border-white/5 disabled:shadow-none rounded-2xl transition-all duration-200 font-black text-sm uppercase tracking-widest shadow-lg shadow-[#dc143c]/20 relative overflow-hidden"
          >
            {!isLocked && !isAddressSame() && !isSubmitting && (
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            )}

            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Save
                className={`w-4 h-4 ${isLocked || isAddressSame() ? "opacity-20" : "opacity-100"}`}
              />
            )}
            <span className="relative">
              {isSubmitting
                ? "Saving Changes..."
                : isLocked || isAddressSame()
                  ? "Update Restricted"
                  : "Confirm & Save Changes"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateAddressModal;
