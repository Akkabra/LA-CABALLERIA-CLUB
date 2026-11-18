# Security Specification — La Caballería Club de Equitación

## 1. Data Invariants
1. **PII Isolation**: `/bookings/{bookingId}` contains student and guardian PII (`studentName`, `phone`, `email`, `guardianName`, `notes`). Public visitors may only `create` a booking; `get`, `list`, `update`, and `delete` are strictly restricted to verified administrators (`isAdmin()`).
2. **Atomic Slot Locking**: Whenever a visitor creates a booking with a specific instructor (`instructorId != 'inst-cualquiera'`), the transaction MUST atomically create the corresponding `/occupiedSlots/{slotId}` document in the same batch (`getAfter(...)`) so double-booking is impossible and no orphan locks are created.
3. **Public Availability Anonymization**: `/occupiedSlots/{slotId}` exposes ONLY `bookingId`, `date`, `timeSlot`, `instructorId`, `createdAt` — zero student names, phones, or emails.
4. **Blog Draft Confidentiality**: Unauthenticated visitors can only `get` or `list` `/blogPosts` documents where `resource.data.published == true`. Drafts (`published == false`) and all blog writes (`create`, `update`, `delete`) require `isAdmin()`.
5. **Immutable Timestamps & Keys**: `createdAt` is locked to `request.time` on creation and cannot be changed on update. Every write checks `hasAll` + `hasOnly` (on create) and `affectedKeys().hasOnly(...)` (on update) to eliminate shadow fields.
6. **Push Endpoint Privacy**: `/pushSubscriptions/{subId}` endpoints and keys cannot be listed or read publicly; only administrators can inspect aggregate counts (`list`).

## 2. "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated PII Read**: Unauthenticated `getDoc(/bookings/b1)` or `getDocs(/bookings)` -> Denied.
2. **Unverified Admin Email Spoof**: Signed-in user with `email: "bryanalvarez119@gmail.com"` and `email_verified: false` listing `/bookings` -> Denied.
3. **Shadow Field Injection on Booking**: Public `create` on `/bookings/b1` adding `isVip: true` -> Denied by `hasOnly`.
4. **Backdated Timestamp Spoofing on Booking**: Public `create` on `/bookings/b1` setting `createdAt` to client `Timestamp` instead of `request.time` -> Denied.
5. **Booking Without Slot Lock**: Public `create` on `/bookings/b1` with `instructorId: "inst-andrea"` without matching atomic `/occupiedSlots` batch write -> Denied by `getAfter`.
6. **Orphan Slot Lock**: Public `create` on `/occupiedSlots/2026-12-01__09-00__inst-andrea` without atomic `/bookings` creation -> Denied by `existsAfter`.
7. **Status Forgery on Booking Create**: Public `create` on `/bookings/b1` with `status: "cancelada"` -> Denied.
8. **Invalid Document ID Poisoning**: `create` on `/bookings/bad..id..with..1500chars` -> Denied by `isValidId()`.
9. **Unauthenticated Blog Publish**: Public `create` or `update` on `/blogPosts/post-1` -> Denied by `isAdmin()`.
10. **Draft Blog Scraping**: Unauthenticated `list` on `/blogPosts` without `where('published', '==', true)` -> Denied by `resource.data.published == true` rule enforcement.
11. **Oversized Content DoS**: Admin `create` on `/blogPosts/post-1` with 50KB `excerpt` -> Denied by `excerpt.size() <= 400`.
12. **Self-Assigned Admin Escalation**: Signed-in non-admin writing `/admins/{uid}` with `{ role: "admin" }` -> Denied.
