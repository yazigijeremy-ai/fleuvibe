/**
 * Re-exports stripe utilities from the root stripe.js for use throughout the app.
 * The root stripe.js contains the StripeConnectManager class and calcBookingPrice.
 */
export { stripeManager, calcBookingPrice } from '../stripe.js';
