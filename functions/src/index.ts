import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Resend } from "resend";

admin.initializeApp();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@dealschool.in";

// Triggered on new Fellowship Applications
export const onNewApplication = functions.firestore
  .document("applications/{applicationId}")
  .onCreate(async (snap) => {
    const data = snap.data();
    if (!data) return;

    const resendApiKey = process.env.RESEND_API_KEY || (functions.config().resend ? functions.config().resend.key : "");
    if (!resendApiKey) {
      console.warn("Resend API Key is missing. Email dispatch skipped.");
      return;
    }

    const resend = new Resend(resendApiKey);
    const { 
      fullName, mobileNumber, email, linkedinUrl, city, currentStatus,
      collegeName, degree, graduationYear, currentRole, companyName,
      degreeEducationalBackground, yearsOfExperience, startupName,
      industrySector, startupLinkedinProfile, areaOfWork, freelancerLinkedinProfile,
      otherStatusSpecify, primaryReason, primaryReasonOther,
      assessmentQ1, assessmentQ2, assessmentQ3, resumeLink, resumeUrl, discoverySource, discoverySourceOther
    } = data;

    let affiliationLabel = "Affiliation Detail";
    let affiliationValue = "Core Curriculum";
    if (currentStatus === "Student") {
      affiliationLabel = "College / University";
      affiliationValue = collegeName || "Unspecified College";
    } else if (currentStatus === "Working Professional" || currentStatus === "Recent Graduate (0–2 years of experience)") {
      affiliationLabel = "Organization / Company";
      affiliationValue = companyName || "Unspecified Company";
    } else if (currentStatus === "Founder") {
      affiliationLabel = "Founded Venture";
      affiliationValue = startupName || "Unspecified Startup";
    }

    try {
      // 1. Send candidate confirmation email
      await resend.emails.send({
        from: "DealSchool <fellows@dealschool.in>",
        to: email,
        subject: "Resume Received | DealSchool Fellowship Underwriting",
        html: `
          <div style="font-family: Georgia, serif; padding: 32px; background-color: #FCFAF6; color: #111111; max-width: 600px; margin: 0 auto; border: 1px solid rgba(17,17,17,0.1);">
            <div style="border-bottom: 2px solid #D4A62A; padding-bottom: 12px; margin-bottom: 24px;">
              <h2 style="font-style: italic; margin: 0; color: #152238;">DEALSCHOOL</h2>
              <span style="font-family: monospace; font-size: 8px; letter-spacing: 2px; color: #D4A62A; text-transform: uppercase;">Middha Ventures Family Office Desk</span>
            </div>
            
            <p style="font-size: 14px; line-height: 1.6;">Dear <strong>${fullName}</strong>,</p>
            
            <p style="font-size: 14px; line-height: 1.6; font-style: italic; color: #555555; background: rgba(212,166,42,0.05); padding: 12px; border-left: 2px solid #D4A62A;">
              &ldquo;Built for those who want a seat at the table, not a seat in the classroom.&rdquo;
            </p>
            
            <p style="font-size: 14px; line-height: 1.6;">
              We have successfully received your enrollment credentials and sector thesis focus for the fellowship program. Our GP partners are actively evaluating early-stage venture resumes for our upcoming Cohort.
            </p>
            
            <h4 style="font-family: monospace; font-size: 11px; margin: 20px 0 8px 0; letter-spacing: 1.5px; text-transform: uppercase; color: #D4A62A;">Resume Confirmation Snapshot:</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: sans-serif; margin-bottom: 24px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 160px; border-bottom: 1px solid rgba(0,0,0,0.05); text-transform: uppercase; font-size: 10px; color:#555;">Alignment:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.05);">${currentStatus}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 160px; border-bottom: 1px solid rgba(0,0,0,0.05); text-transform: uppercase; font-size: 10px; color:#555;">${affiliationLabel}:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.05);">${affiliationValue}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid rgba(0,0,0,0.05); text-transform: uppercase; font-size: 10px; color:#555;">Primary Motivation:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.05); color: #D4A62A; font-weight: bold;">${primaryReason === "Other" ? (primaryReasonOther || "Other Purpose") : primaryReason}</td>
              </tr>
            </table>
            
            <p style="font-size: 13px; line-height: 1.6; color: #666666;">
              No further operational actions are required on your side. Nominated fellows will be paired with interview parameters within Navi Mumbai or remotely.
            </p>
            
            <div style="border-top: 1px solid rgba(17,17,17,0.1); padding-top: 16px; margin-top: 32px; font-size: 11px; font-family: monospace; color: #888888; line-height: 1.5;">
              Kind regards,<br/>
              <strong>Admissions Desk & General Partners</strong><br/>
              Middha Ventures Family Office
            </div>
          </div>
        `,
      });

      // Assemble structural HTML table of all status information
      let statusDetailsHtml = "";
      if (currentStatus === "Student") {
        statusDetailsHtml = `
          <tr><td style="padding:4px;font-weight:bold;color:#444;">College Name:</td><td style="padding:4px;">${collegeName || ""}</td></tr>
          <tr><td style="padding:4px;font-weight:bold;color:#444;">Degree Course:</td><td style="padding:4px;">${degree || ""}</td></tr>
          <tr><td style="padding:4px;font-weight:bold;color:#444;">Graduation Year:</td><td style="padding:4px;">${graduationYear || ""}</td></tr>
        `;
      } else if (currentStatus === "Recent Graduate (0–2 years of experience)") {
        statusDetailsHtml = `
          <tr><td style="padding:4px;font-weight:bold;color:#444;">Current Role:</td><td style="padding:4px;">${currentRole || ""}</td></tr>
          <tr><td style="padding:4px;font-weight:bold;color:#444;">Company Name:</td><td style="padding:4px;">${companyName || ""}</td></tr>
          <tr><td style="padding:4px;font-weight:bold;color:#444;">Graduation Year:</td><td style="padding:4px;">${graduationYear || ""}</td></tr>
          <tr><td style="padding:4px;font-weight:bold;color:#444;">Degree/Background:</td><td style="padding:4px;">${degreeEducationalBackground || ""}</td></tr>
        `;
      } else if (currentStatus === "Working Professional") {
        statusDetailsHtml = `
          <tr><td style="padding:4px;font-weight:bold;color:#444;">Current Role:</td><td style="padding:4px;">${currentRole || ""}</td></tr>
          <tr><td style="padding:4px;font-weight:bold;color:#444;">Company Name:</td><td style="padding:4px;">${companyName || ""}</td></tr>
          <tr><td style="padding:4px;font-weight:bold;color:#444;">Experience Duration:</td><td style="padding:4px;">${yearsOfExperience || ""}</td></tr>
        `;
      } else if (currentStatus === "Founder") {
        statusDetailsHtml = `
          <tr><td style="padding:4px;font-weight:bold;color:#444;">Startup Name:</td><td style="padding:4px;">${startupName || ""}</td></tr>
          <tr><td style="padding:4px;font-weight:bold;color:#444;">Startup Domain:</td><td style="padding:4px;">${industrySector || ""}</td></tr>
          <tr><td style="padding:4px;font-weight:bold;color:#444;">Startup LinkedIn:</td><td style="padding:4px;"><a href="${startupLinkedinProfile || ''}">${startupLinkedinProfile || ''}</a></td></tr>
        `;
      } else if (currentStatus === "Freelancer") {
        statusDetailsHtml = `
          <tr><td style="padding:4px;font-weight:bold;color:#444;">Area of Work:</td><td style="padding:4px;">${areaOfWork || ""}</td></tr>
          <tr><td style="padding:4px;font-weight:bold;color:#444;">Experience Duration:</td><td style="padding:4px;">${yearsOfExperience || ""}</td></tr>
          <tr><td style="padding:4px;font-weight:bold;color:#444;">LinkedIn Profile:</td><td style="padding:4px;"><a href="${freelancerLinkedinProfile || ''}">${freelancerLinkedinProfile || ''}</a></td></tr>
        `;
      } else if (currentStatus === "Other") {
        statusDetailsHtml = `
          <tr><td style="padding:4px;font-weight:bold;color:#444;">Other Detail:</td><td style="padding:4px;">${otherStatusSpecify || ""}</td></tr>
        `;
      }

      // 2. Notify GP Supervisor
      await resend.emails.send({
        from: "DealSchool Engine <alerts@dealschool.in>",
        to: ADMIN_EMAIL,
        subject: `[Admissions] New Fellowship Application: ${fullName}`,
        html: `
          <div style="font-family: sans-serif; padding: 24px; color: #111111; max-width: 650px; border: 1px solid #ddd; border-radius: 4px;">
            <h3 style="color: #152238; border-bottom: 2px solid #D4A62A; padding-bottom: 10px; margin-bottom: 20px;">
              New Candidate Admission Application & Resume Received
            </h3>
            
            <p style="font-size: 15px; margin-bottom: 15px;"><strong>Candidate Name:</strong> ${fullName}</p>
            
            <h4 style="margin: 15px 0 5px 0; color: #152238; border-bottom: 1px solid #f0f0f0; padding-bottom: 3px; font-size:12px; text-transform:uppercase;">1. Core Coordinates</h4>
            <p style="font-size:13px; margin: 4px 0;"><strong>Mobile Target:</strong> ${mobileNumber}</p>
            <p style="font-size:13px; margin: 4px 0;"><strong>Enterprise Email:</strong> ${email}</p>
            <p style="font-size:13px; margin: 4px 0;"><strong>City Base:</strong> ${city}</p>
            <p style="font-size:13px; margin: 4px 0;"><strong>LinkedIn URL:</strong> <a href="${linkedinUrl}" target="_blank">${linkedinUrl}</a></p>
            
            <h4 style="margin: 20px 0 5px 0; color: #152238; border-bottom: 1px solid #f0f0f0; padding-bottom: 3px; font-size:12px; text-transform:uppercase;">2. Alignment Profile: ${currentStatus}</h4>
            <table style="width:100%; border-collapse:collapse; font-size:13px; margin-top:5px;">
              ${statusDetailsHtml}
            </table>

            <h4 style="margin: 20px 0 5px 0; color: #152238; border-bottom: 1px solid #f0f0f0; padding-bottom: 3px; font-size:12px; text-transform:uppercase;">3. Objective & Support</h4>
            <p style="font-size:13px; margin:4px 0;"><strong>Primary Reason:</strong> ${primaryReason === "Other" ? primaryReasonOther : primaryReason}</p>
            <p style="font-size:13px; margin:4px 0;"><strong>Discovery Channel:</strong> ${discoverySource === "Other" ? discoverySourceOther : discoverySource}</p>
            <p style="font-size:13px; margin:4px 0;"><strong>Resume Link:</strong> <a href="${resumeLink || resumeUrl}" style="color:#d4a62a; font-weight:bold;" target="_blank">View Candidate Resume</a></p>
            
            <h4 style="margin: 20px 0 5px 0; color: #152238; border-bottom: 1px solid #f0f0f0; padding-bottom: 3px; font-size:12px; text-transform:uppercase;">4. Underwriting Assessments</h4>
            
            <div style="background-color: #FCFAF6; border-left: 3px solid #D4A62A; padding: 12px; margin-top: 10px; font-size: 13px; line-height:1.5;">
              <p style="margin:0 0 6px 0; font-weight:bold; color:#152238; font-size:11px;">Scenario Response (Fast growth but high cash-burn marketing):</p>
              <p style="margin:0; color:#333; font-style:italic;">"${assessmentQ1}"</p>
            </div>

            <div style="background-color: #FCFAF6; border-left: 3px solid #D4A62A; padding: 12px; margin-top: 12px; font-size: 13px; line-height:1.5;">
              <p style="margin:0 0 6px 0; font-weight:bold; color:#152238; font-size:11px;">10-Year ₹10 Lakhs Thesis Segment Choose:</p>
              <p style="margin:0; color:#333; font-style:italic;">"${assessmentQ2}"</p>
            </div>
            
            <p style="font-size:13px; margin-top:12px;"><strong>What matters most in early-stage:</strong> <span style="background-color:#152238; color:white; padding:2px 8px; border-radius:3px; font-family:monospace; font-size:11px; font-weight:bold;">${assessmentQ3}</span></p>

            <p style="font-size: 11px; color: #888; margin-top: 32px; border-top: 1px solid #eee; padding-top: 12px; font-family: monospace;">
              This notification was pushed securely by DealSchool triggers. Review stats, update status, or initiate candidate interviews in the Admin dashboard.
            </p>
          </div>
        `,
      });
      console.log(`Dispatched alerts to candidate email and ${ADMIN_EMAIL} successfully.`);
    } catch (err) {
      console.error("Cloud Function failed during Resend dispatch:", err);
    }
  });

// Triggered on new Contact Message logs
export const onNewContactMessage = functions.firestore
  .document("contacts/{contactId}")
  .onCreate(async (snap) => {
    const data = snap.data();
    if (!data) return;

    const resendApiKey = process.env.RESEND_API_KEY || (functions.config().resend ? functions.config().resend.key : "");
    if (!resendApiKey) {
      console.warn("Resend API Key is missing. Email dispatch skipped.");
      return;
    }

    const resend = new Resend(resendApiKey);
    const { name, email, subject, message } = data;

    try {
      await resend.emails.send({
        from: "DealSchool HelpDesk <alerts@dealschool.in>",
        to: ADMIN_EMAIL,
        subject: `[Inquiry Ticket] From ${name}: ${subject}`,
        html: `
          <div style="font-family: sans-serif; padding: 24px; color: #111111;">
            <h3 style="color: #152238; border-bottom: 1px solid #111111; padding-bottom: 10px; margin-bottom: 20px;">
              New Support Inquiry Ticket Created
            </h3>
            <p><strong>Sender Full Name:</strong> ${name}</p>
            <p><strong>Sender Email Address:</strong> ${email}</p>
            <p><strong>Subject Segment:</strong> ${subject}</p>
            
            <div style="background-color: #fafafa; border: 1px solid #eee; padding: 16px; margin-top: 20px; border-radius: 4px;">
              <h4 style="margin: 0 0 8px 0; font-size: 11px; color: #888; font-family: monospace; text-transform: uppercase;">Inquiry Message Content:</h4>
              <p style="font-size: 13px; white-space: pre-wrap; line-height: 1.6; margin: 0; color: #333;">${message}</p>
            </div>
            
            <p style="font-size: 11px; color: #888; margin-top: 32px; border-top: 1px solid #eee; padding-top: 12px;">
              Inspect ticket queues, resolve, or archive messages in real-time within the [Admin Portal].
            </p>
          </div>
        `,
      });
      console.log(`Dispatched inquiry alert to ${ADMIN_EMAIL} successfully.`);
    } catch (err) {
      console.error("Cloud Function failed during Resend contact dispatch:", err);
    }
  });
