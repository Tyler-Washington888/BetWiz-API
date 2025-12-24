const BET360_API_URL = process.env.BET360_API_URL || "http://localhost:5000";

/**
 * Notify Bet360-API of subscription status change
 */
export async function notifyBet360Subscription(
  bet360Email: string,
  isSubscribed: boolean
): Promise<void> {
  try {
    const response = await fetch(`${BET360_API_URL}/api/subscriptions/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bet360Email,
        sportsbook: "betwiz",
        isSubscribed,
      }),
    });

    if (!response.ok) {
      throw new Error(`Bet360-API responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Failed to notify Bet360-API of subscription change:", error);
    
    
  }
}

