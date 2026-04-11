import { NextRequest, NextResponse } from 'next/server';
import { isRazorpayConfigured, razorpay, PLAN_IDS } from '@/lib/razorpay';
import { getFirebaseFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getOptionalServerSession } from '@/lib/server-session';
 
export async function POST(req: NextRequest) {
 const session = await getOptionalServerSession();
 if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

 if (!isRazorpayConfigured()) {
   return NextResponse.json({ error: 'Billing is not configured' }, { status: 503 });
 }
 
 const { planId }: { planId: 'scout' | 'navigator' | 'admiral' } = await req.json();
 if (!PLAN_IDS[planId]) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
 
 const adminDb = getFirebaseFirestore();
 const orgRef = adminDb.collection('organizations').doc(session.user.organizationId);
 const orgDoc = await orgRef.get();
 if (!orgDoc.exists) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
 
 // Create Razorpay subscription
 const subscription = await razorpay.subscriptions.create({
   plan_id:          PLAN_IDS[planId],
   total_count:      120,       // 10 years — effectively unlimited
   quantity:         1,
   customer_notify:  1,
   notes: {
     organizationId: session.user.organizationId,
     userId:         session.user.id,
     planId,
   },
 });
 
 // Persist the subscription ID so the webhook can look up the org
 await orgRef.update({
   razorpaySubscriptionId: subscription.id,
   pendingPlanId:          planId,
   updatedAt:              FieldValue.serverTimestamp(),
 });
 
 // Return the short URL — frontend opens it via Razorpay Checkout or redirect
 return NextResponse.json({
   subscriptionId: subscription.id,
   shortUrl:       subscription.short_url,  // Hosted checkout page
 });
}
