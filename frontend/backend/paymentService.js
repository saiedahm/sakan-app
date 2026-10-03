// SAKAN - Central Payment Core client
async function createCheckoutSession(userId, planType, customerEmail) {
  const allowed = ["GOLD", "VIP", "AD_99_CENTS"];
  if (!allowed.includes(planType)) {
    return { success: false, error: "Invalid payment plan." };
  }

  const coreUrl = String(process.env.PAYMENT_CORE_URL || "https://www.nexoraonline.de").replace(/\/$/, "");
  const coreSecret = process.env.PAYMENT_CORE_SECRET;
  if (!coreSecret) {
    return { success: false, error: "Central payment service is not configured." };
  }

  try {
    const response = await fetch(coreUrl + "/api/payments/core/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + coreSecret
      },
      body: JSON.stringify({
        platform: "sakan",
        product: planType,
        externalUserId: String(userId),
        customerEmail: customerEmail || ""
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.url) {
      return { success: false, error: data.error || "Unable to create checkout session." };
    }

    return { success: true, url: data.url, sessionId: data.sessionId };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Payment service unavailable." };
  }
}

module.exports = { createCheckoutSession };
