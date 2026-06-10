# Security Specification: DealSchool Firebase

This specification outlines the data invariants, threat-model payloads, and validation requirements to secure the DealSchool Firebase integration.

## 1. Data Invariants

1. **Unregistered Admissions/Inquiries**: Unauthenticated users can create applications and contact requests, but they cannot read, write, update, or delete any of them afterwards.
2. **System-wide Admin Boundaries**: Only authenticated admin users (with emails matching `admin@dealschool.in` or configured in the `admins` collection) have full access to view, search, filter, and modify document statuses.
3. **Application Immutability for Admins**: Admins can change status of applications, but core fields from the initial applicant (`fullName`, `email`, `motivation`, etc.) are not mutable after submission.
4. **Id Validation & Size Enforcement**: Document IDs, strings, and inputs must match size constraints to prevent Denial-of-Wallet (DoW) and character injection attacks. All text inputs are size-capped.

---

## 2. The "Dirty Dozen" Vulnerability Payloads

The following 12 payloads are designed to challenge and test the security rules:

### Vulnerability Tier A: Identity Spoofing & Escalation
1. **P1 (Self-Elevation)**: Attempting to create or modify an admin role entry in `admins` as an unauthenticated or standard user.
2. **P2 (Unverified Email Admin Hijack)**: Attempting to bypass authorization by providing a token containing the email `admin@dealschool.in` but with `email_verified` as `false`.
3. **P3 (Direct App Read by Non-Admin)**: Attempting to fetch lists of other users' applications as an unauthenticated or standard authenticated user.

### Vulnerability Tier B: Client Integrity & State Shortcutting
4. **P4 (Immediate Acceptance Trick)**: A candidate attempting to write an application with the state pre-marked as `accepted`.
5. **P5 (Lock-State Bypass)**: Attempting to change an application status back to `pending` once it has reached a terminal status (`accepted` or `declined`) by a non-admin.
6. **P6 (Field Overwrite)**: Attempting to change the `email` or `fullName` of an existing submitted application after creation.

### Vulnerability Tier C: Denial of Wallet & Resource Poisoning
7. **P7 (Junk ID Poisoning)**: Sending an application with a 1.5KB document ID consisting of special/malicious characters.
8. **P8 (Binge Payload Exploit)**: Submitting an application contains high-overhead motivation text (e.g. 5MB) bypassing string size limit check.
9. **P9 (Missing Vital Keys)**: Creating an application without required properties like `fullName` or `email` (creating orphans/shadow elements).

### Vulnerability Tier D: Temporal & Relational Violations
10. **P10 (Cheat Timestamps)**: Attempting to submit an application indicating it was created 10 years ago (`createdAt = 2016-01-01T00:00:00Z` instead of `request.time`).
11. **P11 (Junk Contact Form Status)**: Sending a contact message with status set to `archived` or some custom rogue value.
12. **P12 (Malicious Update to Contact Log)**: Altering a message body of a contact inquiry after it has been received by the systems.

---

## 3. Test Runner Design: `firestore.rules.test.ts`

These definitions verify that any malicious payload triggers `PERMISSION_DENIED` under our rigorous `firestore.rules` enforcement.

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

describe("DealSchool Fortress Rule Verification", () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "dealschool-dev",
      firestore: {
        rules: require("fs").readFileSync("firestore.rules", "utf8"),
      }
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it("P1 (Self-Elevation): Should fail to create admins document", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(unauthedDb, "admins/rogue_user"), { role: "admin" }));
  });

  it("P2 (Unverified Email Admin Hijack): Should fail admin functions", async () => {
    const fakeAdminDb = testEnv.authenticatedContext("hack_1", {
      email: "admin@dealschool.in",
      email_verified: false,
    }).firestore();
    await assertFails(getDoc(doc(fakeAdminDb, "applications/any_id")));
  });

  it("P3 (Direct App Read by Non-Admin): Should deny list/get applications", async () => {
    const standardUserDb = testEnv.authenticatedContext("standard_user").firestore();
    await assertFails(getDoc(doc(standardUserDb, "applications/app_id_1")));
  });

  it("P4 (Immediate Acceptance Trick): Initial submissions must default status to pending", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      setDoc(doc(unauthedDb, "applications/app_1"), {
        fullName: "Test Applicant",
        email: "test@example.com",
        institution: "IIT",
        major: "CS",
        excitedSector: "SaaS & Fintech Systems",
        motivation: "Test Motivation",
        status: "accepted", // Violation: illegal state creation
        createdAt: new Date(),
      })
    );
  });
});
```
