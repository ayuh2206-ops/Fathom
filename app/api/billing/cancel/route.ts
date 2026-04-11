import { NextRequest, NextResponse } from 'next/server';
import { isRazorpayConfigured, razorpay } from '@/lib/razorpay';
import { getFirebaseFirestore } from '@/lib/firebase-admin';
import { getOptionalServerSession } from '@/lib/server-session';
 
export async function POST(req: NextRequest) {
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 const _ignored = req;
 const session = await getOptionalServerSession();
 if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

 if (!isRazorpayConfigured()) {
   return NextResponse.json({ error: 'Billing is not configured' }, { status: 503 });
 }
 
 const adminDb = getFirebaseFirestore();
 const orgDoc = await adminDb.collection('organizations').doc(session.user.organizationId).get();
 const orgData = orgDoc.data();
 if (!orgData) return NextResponse.json({ error: 'Org not found' }, { status: 404 });
 
 const { razorpaySubscriptionId } = orgData;
 
 if (!razorpaySubscriptionId) {
   return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
 }
 
 // cancel_at_cycle_end = 1 means it stays active until the period ends
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 await razorpay.subscriptions.cancel(razorpaySubscriptionId, { cancel_at_cycle_end: 1 } as any);
 
 return NextResponse.json({ success: true });
}
