import { ComponentType, useEffect, useState } from 'react';
import useTenant from '@/hooks/useTenant';
import useCustomizationRegistry from './useCustomizationRegistry';
import { loadCustomizationScript } from './loadCustomizationScript';

const GATEWAY_HOST = import.meta.env.VITE_GATEWAY_HOST;

interface CustomizationSlotProps {
  pointKey: string;
  [key: string]: unknown;
}

function CustomizationSlot({ pointKey, ...props }: CustomizationSlotProps) {
  const realm = useTenant();
  const activePoints = useCustomizationRegistry(realm);
  const isCustomized = activePoints.includes(pointKey);
  const [Component, setComponent] = useState<ComponentType<Record<string, unknown>> | null>(null);

  useEffect(() => {
    if (!isCustomized || !realm) {
      setComponent(null);
      return;
    }
    let cancelled = false;
    loadCustomizationScript(`${GATEWAY_HOST}/custom/${realm}/${pointKey}/ui/index.js`, localStorage.getItem('access_token'))
      .then(() => {
        if (!cancelled) {
          setComponent(() => window.__miscCloudCustomizations__?.[pointKey] ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setComponent(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isCustomized, realm, pointKey]);

  if (!Component) {
    return null;
  }
  return <Component {...props} realm={realm} gatewayHost={GATEWAY_HOST} token={localStorage.getItem('access_token')} />;
}

export default CustomizationSlot;
