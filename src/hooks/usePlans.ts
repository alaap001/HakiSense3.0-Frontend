import { useQuery } from "@tanstack/react-query"

import { getPlans } from "@/lib/billing"

/**
 * Backend-driven pricing (GET /api/plans) for the landing pricing section + the billing page.
 * Public, so it loads for signed-out visitors too. Cached a few minutes — prices change rarely.
 */
export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: getPlans,
    staleTime: 5 * 60 * 1000,
  })
}
