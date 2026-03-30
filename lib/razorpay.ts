import Razorpay from 'razorpay';
 
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
 throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set');
}
 
export const razorpay = new Razorpay({
 key_id:     process.env.RAZORPAY_KEY_ID,
 key_secret: process.env.RAZORPAY_KEY_SECRET,
});
 
export const PLAN_IDS: Record<'scout'|'navigator'|'admiral', string> = {
 scout:     process.env.RAZORPAY_PLAN_SCOUT!,
 navigator: process.env.RAZORPAY_PLAN_NAVIGATOR!,
 admiral:   process.env.RAZORPAY_PLAN_ADMIRAL!,
};
