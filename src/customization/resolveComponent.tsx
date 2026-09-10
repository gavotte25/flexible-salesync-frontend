import useTenant from '@/hooks/useTenant';
import { ComponentType, lazy, useMemo } from 'react';
import useCustomizationRegistry from './useCustomizationRegistry';

const GATEWAY_HOST = import.meta.env.VITE_GATEWAY_HOST;

/**
 * MiSC-Cloud "WebMVC Customizer" pointcut for a single React route/component. Wraps
 * DefaultComponent (itself typically already `React.lazy`-loaded, per this app's existing
 * route-level code splitting) so that, when the current tenant has an active customization
 * registration for `pointKey`, its override module - served through the Customization API
 * Gateway - is loaded in its place instead.
 *
 * With no customization registered for a tenant (the case for every tenant today, since no
 * concrete customization has been built against this mechanism yet), this always renders
 * DefaultComponent unchanged.
 *
 * The override module's bundling contract (format, default export shape) is intentionally
 * left open for whenever a real customization microservice is built - this only wires the
 * hook point.
 */
function resolveComponent<P extends object>(pointKey: string, DefaultComponent: ComponentType<P>): ComponentType<P> {
  return function CustomizableComponent(props: P) {
    const realm = useTenant();
    const activePoints = useCustomizationRegistry(realm);
    const isCustomized = activePoints.includes(pointKey);

    const ResolvedComponent = useMemo(() => {
      if (!isCustomized || !realm) {
        return DefaultComponent;
      }
      return lazy(() => import(/* @vite-ignore */ `${GATEWAY_HOST}/custom/${realm}/${pointKey}/ui/index.js`));
    }, [isCustomized, realm]);

    return <ResolvedComponent {...props} />;
  };
}

export default resolveComponent;
