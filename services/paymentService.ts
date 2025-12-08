/**
 * PAYMENT BACKEND SIMULATION
 * 
 * In a real-world application, this code would reside on a secure server (Node.js/Express).
 * The Secret Key (sk_test_...) provided in the prompt would be stored in environment variables on that server.
 * 
 * Flow:
 * 1. Frontend sends payment amount and currency.
 * 2. Backend uses `stripe.paymentIntents.create` with the Secret Key.
 * 3. Backend returns the `client_secret` to the frontend.
 */

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export const processPayment = async (token: string, amount: number): Promise<PaymentResult> => {
  // SIMULATED NETWORK DELAY
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In a real backend, we would use the secret key here:
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const charge = await stripe.charges.create({ ... });

  console.log(`Processing payment of $${amount} with token ${token}`);

  // Simulate success for valid test tokens, or random success
  if (token) {
    return {
      success: true,
      transactionId: `tx_${Math.random().toString(36).substr(2, 12)}`
    };
  }

  return {
    success: false,
    error: 'Payment authorization failed.'
  };
};