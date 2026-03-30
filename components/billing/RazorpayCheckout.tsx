'use client';
import { useState } from 'react';
 
declare global {
 interface Window { Razorpay: new (opts: Record<string, unknown>) => { open: () => void }; }
}
 
interface Props {
 planId: 'scout' | 'navigator' | 'admiral';
 planName: string;
 amountDisplay: string;
 userEmail: string;
 userName: string;
}
 
export function RazorpayCheckout({ planId, planName, amountDisplay, userEmail, userName }: Props) {
 const [loading, setLoading] = useState(false);
 
 async function handleSubscribe() {
   setLoading(true);
 
   // Load Razorpay script dynamically
   if (!window.Razorpay) {
     await new Promise<void>((resolve) => {
       const s = document.createElement('script');
       s.src = 'https://checkout.razorpay.com/v1/checkout.js';
       s.onload = () => resolve();
       document.head.appendChild(s);
     });
   }
 
   const res = await fetch('/api/billing/create-subscription', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ planId }),
   });
 
   if (!res.ok) { setLoading(false); alert('Failed to create subscription.'); return; }
 
   const { subscriptionId } = await res.json();
 
   const rzp = new window.Razorpay({
     key:             process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
     subscription_id: subscriptionId,
     name:            'FATHOM Maritime Intelligence',
     description:     `${planName} Plan`,
     prefill: { email: userEmail, name: userName },
     theme: { color: '#0EA5E9' },
     handler: function() {
       // Webhook handles actual activation — just redirect to success
       window.location.href = '/dashboard/settings?tab=billing&success=true';
     },
     modal: {
       ondismiss: () => setLoading(false),
     }
   });
 
   rzp.open();
   setLoading(false);
 }
 
 return (
   <button onClick={handleSubscribe} disabled={loading}
     className='bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-lg font-semibold transition'>
     {loading ? 'Loading...' : `Upgrade to ${planName} — ${amountDisplay}`}
   </button>
 );
}
