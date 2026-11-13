import { useCallback, useRef, useState } from 'react';

import { checkPincode, isValidPincode, reverseGeocode } from '@/api/mockApi';

import { getDeviceLocation, openAppSettings, turnOnLocationServices } from './locationService';

/**
 * State machine for "where should we deliver?". Every branch ends in an address,
 * a pincode prompt or browsing — there is no dead end (finding U1).
 */
export function useLocationFlow() {
  const [state, setState] = useState({ step: 'intro' });
  // Ignore results of a lookup the user has already moved away from.
  const attempt = useRef(0);

  const locateMe = useCallback(async () => {
    const id = ++attempt.current;
    setState({ step: 'locating' });
    const result = await getDeviceLocation();
    if (id !== attempt.current) return;
    if (result.kind !== 'ok') {
      setState({ step: 'problem', reason: result.kind });
      return;
    }
    const place = await reverseGeocode(result.coords);
    if (id !== attempt.current) return;
    setState(
      place.serviceable ? { step: 'confirm', address: place.address } : { step: 'notServiceable', place: place.place },
    );
  }, []);

  const showPincode = useCallback(() => {
    attempt.current++;
    setState({ step: 'pincode', checking: false, error: null });
  }, []);

  const submitPincode = useCallback(async (pin) => {
    if (!isValidPincode(pin)) {
      setState({ step: 'pincode', checking: false, error: 'Enter a valid 6-digit pincode.' });
      return;
    }
    const id = ++attempt.current;
    setState({ step: 'pincode', checking: true, error: null });
    const result = await checkPincode(pin);
    if (id !== attempt.current) return;
    setState(
      result.serviceable
        ? { step: 'confirm', address: result.address }
        : { step: 'notServiceable', place: result.place },
    );
  }, []);

  const turnOnServicesAndRetry = useCallback(async () => {
    const enabled = await turnOnLocationServices();
    if (enabled) await locateMe();
  }, [locateMe]);

  const backToIntro = useCallback(() => {
    attempt.current++;
    setState({ step: 'intro' });
  }, []);

  return {
    state,
    locateMe,
    showPincode,
    submitPincode,
    turnOnServicesAndRetry,
    openAppSettings,
    backToIntro,
  };
}
