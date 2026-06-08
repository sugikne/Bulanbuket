# Security Specification for Moon Bouquet

This document outlines the security architecture and rules for the Moon Bouquet Firestore database to prevent privilege escalation, data poisoning, and unauthorized alterations.

## Data Invariants

1. **Products, Categories, and Settings** are read-only for public visitors, and only writeable by an authenticated administrator.
2. **Orders** can be created by any visitor (public purchase flow) but can only be read, modified, or deleted by an authenticated administrator.
3. **Testimonials** can be read by anyone (filtered by approved status in the client), submitted by anyone, but can only be approved, updated, or deleted by an administrator.
4. **Administrative access** is locked to `putusugianta2005@gmail.com` and records inside an `admins` collection.

## The Dirty Dozen (Vulnerability Test Scenarios)

1. **Anonymous Product Creation**: A random user tries to create a custom product. (Expected: DENIED)
2. **Unauthorized Product Update**: A normal user tries to discount a bouquet price. (Expected: DENIED)
3. **Malicious ID Injection**: A user submits a product or order with an extremely long, poisoned key ID. (Expected: DENIED via `isValidId()`)
4. **Order Read Scraping**: A normal visitor tries to list all customer orders. (Expected: DENIED)
5. **Self-Approval of Testimonials**: A user creates a testimonial and sets `isApproved` to `true`. (Expected: DENIED - testimonials must be created with `isApproved == false` unless written by admin)
6. **Setting Tampering**: A visitor tries to change the WhatsApp checkout number inside `settings`. (Expected: DENIED)
7. **Order Status Manipulation**: A visitor attempts to transition an order to "completed" without admin permission. (Expected: DENIED)
8. **Admin Role Spoofing**: A user attempts to create an admin document with their own auth UID. (Expected: DENIED)
9. **Fake Email Invariant Bypass**: A user logins using a non-verified email or spoofed claims. (Expected: DENIED)
10. **Product Schema Corruption**: Admin or user tries to save an object as a product with missing standard attributes. (Expected: DENIED)
11. **Negative Price Exploit**: Creating a product or order with a negative price. (Expected: DENIED)
12. **System Config Overwrite**: Deleting global store configurations. (Expected: DENIED)
