const BASE = (content: string) => `
<div style='font-family:Arial,sans-serif;background:#F1F5F9;padding:40px 0'>
 <div style='max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden'>
   <div style='background:#0F1B2D;padding:24px 32px'>
     <h1 style='color:#fff;margin:0;font-size:24px'>FATHOM</h1>
     <p style='color:#94D2BD;margin:4px 0 0;font-size:13px'>Maritime Intelligence Platform</p>
   </div>
   <div style='padding:32px'>${content}</div>
   <div style='background:#F8FAFC;padding:16px 32px;font-size:12px;color:#9CA3AF'>
     <p>You received this email because you have a FATHOM account.</p>
   </div>
 </div>
</div>`;
 
export const welcomeTemplate = (name: string, org: string) => BASE(`
 <h2 style='color:#0F1B2D'>Welcome aboard, ${name}</h2>
 <p style='color:#374151'>${org} is now protected by FATHOM's AI fraud detection.</p>
 <a href='https://yourfathom.com/dashboard'
    style='display:inline-block;background:#0EA5E9;color:#fff;padding:12px 24px;
           border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px'>
   Go to Dashboard
 </a>`
);
 
export const analysisTemplate = (invoiceNumber: string, fraudScore: number, riskLevel: string, riskColor: string, invoiceUrl: string) => BASE(`
 <h2 style='color:#0F1B2D'>Analysis Complete: ${invoiceNumber}</h2>
 <p style='color:#374151'>Our AI has finished processing this document.</p>
 <div style='background:#F8FAFC;border-left:4px solid ${riskColor};padding:16px;margin:20px 0'>
   <p style='margin:0'><strong>Fraud Score:</strong> ${fraudScore}/100</p>
   <p style='margin:8px 0 0'><strong>Risk Level:</strong> <span style='color:${riskColor};font-weight:bold'>${riskLevel.toUpperCase()}</span></p>
 </div>
 <a href='${invoiceUrl}'
    style='display:inline-block;background:#0EA5E9;color:#fff;padding:12px 24px;
           border-radius:6px;text-decoration:none;font-weight:bold'>
   View Full Report
 </a>`
);

export const alertTemplate = (alertType: string, vesselName: string, location: string, severity: string, alertsUrl: string) => BASE(`
 <h2 style='color:#0F1B2D'>Fleet Alert: ${vesselName}</h2>
 <p style='color:#374151'>A new <strong style='text-transform:uppercase'>${severity}</strong> priority alert has been triggered.</p>
 <ul style='color:#374151;line-height:1.6'>
   <li><strong>Type:</strong> ${alertType}</li>
   <li><strong>Vessel:</strong> ${vesselName}</li>
   <li><strong>Location:</strong> ${location}</li>
 </ul>
 <a href='${alertsUrl}'
    style='display:inline-block;background:#0EA5E9;color:#fff;padding:12px 24px;
           border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px'>
   View Alert Details
 </a>`
);

export const inviteTemplate = (inviterName: string, organizationName: string, inviteUrl: string) => BASE(`
 <h2 style='color:#0F1B2D'>You've been invited!</h2>
 <p style='color:#374151'><strong>${inviterName}</strong> has invited you to join the team for <strong>${organizationName}</strong>.</p>
 <a href='${inviteUrl}'
    style='display:inline-block;background:#0EA5E9;color:#fff;padding:12px 24px;
           border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px'>
   Accept Invitation
 </a>`
);

export const disputeTemplate = (vendorName: string, newStatus: string, disputeUrl: string) => BASE(`
 <h2 style='color:#0F1B2D'>Dispute Updated</h2>
 <p style='color:#374151'>The status for your dispute with <strong>${vendorName}</strong> has changed.</p>
 <p style='color:#374151'><strong>New Status:</strong> ${newStatus}</p>
 <a href='${disputeUrl}'
    style='display:inline-block;background:#0EA5E9;color:#fff;padding:12px 24px;
           border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px'>
   View Dispute
 </a>`
);
