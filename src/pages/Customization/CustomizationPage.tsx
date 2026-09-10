import { ComponentType, useEffect, useState } from 'react';
import useTenant from '@/hooks/useTenant';
import LoadingSpinner from '@/components/ui/Loading/LoadingSpinner';
import useCustomizationRegistry from '@/customization/useCustomizationRegistry';
import { loadCustomizationScript } from '@/customization/loadCustomizationScript';

const GATEWAY_HOST = import.meta.env.VITE_GATEWAY_HOST;

interface CustomizationPageProps {
  pointKey: string;
}

function CustomizationPage({ pointKey }: CustomizationPageProps) {
  const realm = useTenant();
  const activePoints = useCustomizationRegistry(realm);
  const isCustomized = activePoints.includes(pointKey);
  const [Component, setComponent] = useState<ComponentType<Record<string, unknown>> | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isCustomized || !realm) {
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
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isCustomized, realm, pointKey]);

  if (!isCustomized || failed) {
    return <div className='flex h-full w-full items-center justify-center'>Page not found.</div>;
  }
  if (!Component) {
    return <LoadingSpinner />;
  }
  return <Component realm={realm} gatewayHost={GATEWAY_HOST} token={localStorage.getItem('access_token')} />;
}

export default CustomizationPage;
