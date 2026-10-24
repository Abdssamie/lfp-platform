export const PLAN_INTERVALS = ["month", "year"] as const;

export type PlanInterval = (typeof PLAN_INTERVALS)[number];
export type PlanId = "free" | "pro" | "business";

type PlanMetadata = Record<string, unknown> | null | undefined;

export type BillingProduct = {
  id: string;
  name: string;
  description?: string | null;
  recurringInterval?: string | null;
  metadata?: PlanMetadata;
  prices: Array<{
    amountType?: string | null;
    priceAmount?: number | null;
    priceCurrency?: string | null;
    recurringInterval?: string | null;
  }>;
};

export type BillingPlan = {
  id: PlanId;
  name: string;
  badge?: string | null;
  description: string;
  features: string[];
  monthlyProduct?: BillingProduct | null;
  yearlyProduct?: BillingProduct | null;
};

export type CurrentSubscription = {
  productId: string;
  status: string;
  product: BillingProduct;
} | null;

export function getPlanProduct(plan: BillingPlan, interval: PlanInterval) {
  return interval === "year" ? (plan.yearlyProduct ?? plan.monthlyProduct) : plan.monthlyProduct;
}

export function formatPlanPrice(product?: BillingProduct | null, interval: PlanInterval = "month") {
  if (!product) {
    return { amount: "Custom pricing", cadence: interval === "year" ? "Per year" : "Per month" };
  }

  const price =
    product.prices.find((entry) => entry.recurringInterval === interval) ??
    product.prices.find((entry) => entry.priceAmount != null) ??
    product.prices[0];

  if (!price || price.amountType === "free" || price.priceAmount === 0) {
    return { amount: "$0", cadence: "Free forever" };
  }

  if (price.priceAmount == null) {
    return { amount: "Custom pricing", cadence: interval === "year" ? "Per year" : "Per month" };
  }

  return {
    amount: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price.priceCurrency?.toUpperCase() || "USD",
      maximumFractionDigits: 0,
    }).format(price.priceAmount / 100),
    cadence: interval === "year" ? "Per year" : "Per month",
  };
}

export function getSubscriptionPlanId(subscription: CurrentSubscription): PlanId {
  const rawPlan = getMetadataString(subscription?.product.metadata, "plan");
  if (rawPlan === "pro" || rawPlan === "business") {
    return rawPlan;
  }

  return "free";
}

export function getSubscriptionInterval(subscription: CurrentSubscription): PlanInterval {
  const fromMetadata = getMetadataString(subscription?.product.metadata, "interval");
  if (fromMetadata === "year") {
    return "year";
  }

  if (fromMetadata === "month") {
    return "month";
  }

  const recurringInterval = subscription?.product.recurringInterval;
  return recurringInterval === "year" ? "year" : "month";
}

function getMetadataString(metadata: PlanMetadata, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" ? value : null;
}
