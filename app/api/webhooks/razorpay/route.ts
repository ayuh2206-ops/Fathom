import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getFirebaseFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { isRazorpayConfigured } from '@/lib/razorpay';
 
function verifySignature(body: string, signature: string): boolean {
 const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
 if (!secret || !signature) {
   return false;
 }

 const expected = crypto
   .createHmac('sha256', secret)
   .update(body)
   .digest('hex');
 const expectedBuffer = Buffer.from(expected);
 const providedBuffer = Buffer.from(signature);

 if (expectedBuffer.length !== providedBuffer.length) {
   return false;
 }

 return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}
 
async function findOrgBySubscriptionId(subscriptionId: string): Promise<string | null> {
 const adminDb = getFirebaseFirestore();
 const snap = await adminDb.collection('organizations')
   .where('razorpaySubscriptionId', '==', subscriptionId)
   .limit(1).get();
 return snap.empty ? null : snap.docs[0].id;
}
 
export async function POST(req: NextRequest) {
 if (!isRazorpayConfigured() || !process.env.RAZORPAY_WEBHOOK_SECRET) {
   return NextResponse.json({ error: 'Billing webhook is not configured' }, { status: 503 });
 }

 const body = await req.text();
 const signature = req.headers.get('x-razorpay-signature') ?? '';
 
 if (!verifySignature(body, signature)) {
   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
 }
 
 const event = JSON.parse(body);
 const { event: eventType, payload } = event;
 
 // Process asynchronously — return 200 immediately
 void handleEvent(eventType, payload);
 
 return NextResponse.json({ received: true });
}
 
async function handleEvent(eventType: string, payload: Record<string, unknown>) {
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const sub = (payload as any).subscription?.entity;
 if (!sub) return;
 
 const orgId = await findOrgBySubscriptionId(sub.id);
 if (!orgId) { console.error('No org found for sub:', sub.id); return; }
 
 const adminDb = getFirebaseFirestore();
 const orgRef = adminDb.collection('organizations').doc(orgId);
 const planId = sub.notes?.planId ?? null;
 
 const PLAN_LIMITS: Record<string, number> = {
   scout: 50, navigator: 200, admiral: Infinity
 };
 
 switch (eventType) {
   case 'subscription.activated':
     await orgRef.update({
       subscriptionPlan:    planId,
       subscriptionStatus:  'active',
       invoiceLimit:        PLAN_LIMITS[planId] ?? 50,
       currentPeriodEnd:    new Date(sub.current_end * 1000).toISOString(),
       updatedAt:           FieldValue.serverTimestamp(),
     }); break;
   case 'subscription.charged':
     await orgRef.update({
       subscriptionStatus: 'active',
       currentPeriodEnd:   new Date(sub.current_end * 1000).toISOString(),
       updatedAt:          FieldValue.serverTimestamp(),
     }); break;
   case 'subscription.cancelled':
   case 'subscription.completed':
     await orgRef.update({
       subscriptionStatus: 'cancelled',
       subscriptionPlan:   'trial',
       invoiceLimit:       5,
       updatedAt:          FieldValue.serverTimestamp(),
     }); break;
   case 'subscription.halted':
     await orgRef.update({
       subscriptionStatus: 'past_due',
       updatedAt:          FieldValue.serverTimestamp(),
     }); break;
   default:
     console.log('Unhandled Razorpay event:', eventType);
 }
}
