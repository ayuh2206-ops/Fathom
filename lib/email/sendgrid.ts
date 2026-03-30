import sgMail from '@sendgrid/mail';
import {
 welcomeTemplate, analysisTemplate, alertTemplate, inviteTemplate, disputeTemplate
} from './templates';
 
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY is not set. Emails won\'t be sent.');
}
 
const FROM = {
 email: process.env.SENDGRID_FROM_EMAIL!,
 name:  process.env.SENDGRID_FROM_NAME ?? 'FATHOM Maritime',
};
 
// ── 1. Welcome email ──────────────────────────────────────────
export async function sendWelcomeEmail(
 to: string, name: string, organizationName: string
): Promise<void> {
 await sgMail.send({
   to, from: FROM,
   subject: 'Welcome to FATHOM — Your maritime fraud protection is active',
   html: welcomeTemplate(name, organizationName),
 });
}
 
// ── 2. Invoice analysis complete ─────────────────────────────
export async function sendInvoiceAnalysisComplete(
 to: string, invoiceNumber: string, fraudScore: number,
 riskLevel: string, invoiceUrl: string
): Promise<void> {
 const riskColor = fraudScore > 60 ? '#EF4444' : fraudScore > 30 ? '#F59E0B' : '#10B981';
 await sgMail.send({
   to, from: FROM,
   subject: `Invoice ${invoiceNumber} Analysis — ${riskLevel.toUpperCase()} Risk Detected`,
   html: analysisTemplate(invoiceNumber, fraudScore, riskLevel, riskColor, invoiceUrl),
 });
}
 
// ── 3. Fleet alert notification ───────────────────────────────
export async function sendAlertNotification(
 to: string, alertType: string, vesselName: string,
 location: string, severity: string, alertsUrl: string
): Promise<void> {
 await sgMail.send({
   to, from: FROM,
   subject: `[${severity.toUpperCase()}] Fleet Alert: ${alertType} — ${vesselName}`,
   html: alertTemplate(alertType, vesselName, location, severity, alertsUrl),
 });
}
 
// ── 4. Team invite ────────────────────────────────────────────
export async function sendTeamInvite(
 to: string, inviterName: string, organizationName: string,
 inviteUrl: string
): Promise<void> {
 await sgMail.send({
   to, from: FROM,
   subject: `${inviterName} has invited you to join FATHOM`,
   html: inviteTemplate(inviterName, organizationName, inviteUrl),
 });
}
 
// ── 5. Dispute status update ──────────────────────────────────
export async function sendDisputeStatusUpdate(
 to: string, vendorName: string, newStatus: string, disputeUrl: string
): Promise<void> {
 await sgMail.send({
   to, from: FROM,
   subject: `Dispute Update: ${vendorName} — Status: ${newStatus}`,
   html: disputeTemplate(vendorName, newStatus, disputeUrl),
 });
}
