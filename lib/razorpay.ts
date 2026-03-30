import Razorpay from 'razorpay';
 
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are not set. Payments will not work.');
}
 
export const razorpay = new Razorpay({
 key_id:     process.env.RAZORPAY_KEY_ID || 'dummy',
 key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy',
});
 
export const PLAN_IDS: Record<'scout'|'navigator'|'admiral', string> = {
 scout:     process.env.RAZORPAY_PLAN_SCOUT!,
 navigator: process.env.RAZORPAY_PLAN_NAVIGATOR!,
 admiral:   process.env.RAZORPAY_PLAN_ADMIRAL!,
};
