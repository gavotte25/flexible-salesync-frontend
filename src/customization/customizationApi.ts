import instance from '@/api/axiosConfig';

const GATEWAY_HOST = import.meta.env.VITE_GATEWAY_HOST;

type CustomizationPointDto = {
  customizationPoint: string;
};

/**
 * Active customization points for a tenant, via the Customization API Gateway
 * (which itself resolves the list from Tenant Manager). Returns an empty list
 * (rather than throwing) when the gateway/tenant-manager aren't reachable, so a
 * customization outage never blocks the default product experience.
 */
export async function fetchActiveCustomizationPoints(realm: string): Promise<string[]> {
  if (!realm) {
    return [];
  }
  try {
    const { data } = await instance.get<CustomizationPointDto[]>(`${GATEWAY_HOST}/custom/${realm}/registry`);
    return data.map((entry) => entry.customizationPoint);
  } catch {
    return [];
  }
}
