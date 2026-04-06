• Findings (highest risk first)

  1. Duplicate route registration creates dead code and confusion
     POST /posts/:id/comments is declared twice; the second one is effectively unreachable and has different middleware (no upload). This is a clear organization issue and can cause regressions if order changes.
     backend/src/routes/routes.js:58
     backend/src/routes/routes.js:65
  2. postService deletion flows are not transactional
     deletePost and deleteComment do multiple DB deletes + filesystem deletes step-by-step without a Prisma transaction. If one query fails mid-way, state can be partially deleted.
     backend/src/services/postService.js:145
     backend/src/services/postService.js:169
     backend/src/services/postService.js:441
     backend/src/services/postService.js:453
  3. Error contract between controller/service is inconsistent
     Service throws plain Error("...") strings, but most handlers convert everything to 500, while one handler maps specific messages to 404/403. This makes API behavior inconsistent and hard to maintain.
     backend/src/controllers/postController.js:93
     backend/src/controllers/postController.js:136
     backend/src/services/postService.js:121
  4. Organization duplication across layers/files
     Post/comment response formatting logic is duplicated in postService and userController (formatPost vs formatFeedPost), increasing drift risk.
     backend/src/services/postService.js:29
     backend/src/controllers/userController.js:367

  Quick judgment

  Current structure is usable but not cleanly scaled: roughly 6/10 for organization. The controller/service split exists, but consistency, shared contracts, and duplication control need tightening before evaluation-level “I
  can explain the whole backend clearly.”
  
---

• Major DB flaws I see:

  1. No DB-level uniqueness on friendships (race-condition bug)
     Your app checks duplicates in code, but the Friends table has no unique constraint on the pair, so concurrent requests can still create duplicate rows.
     backend/prisma/schema.prisma:95
     backend/src/controllers/friendController.js:26
  2. No cascade strategy on key relations forces fragile manual deletes
     Most foreign keys are ON DELETE RESTRICT, so deleting parent records depends on application cleanup order. You already do multi-step manual cleanup in services, which is error-prone if one query fails mid-way.
     backend/prisma/migrations/20260317131946_add_all_models/migration.sql:73
     backend/prisma/migrations/20260325154434_sync_comment_media_and_relations/migration.sql:38
     backend/src/services/postService.js:145
  3. Friend status is free text, not constrained
     status is a plain String, so invalid values can enter the DB ("acceptd", etc.) and break logic silently.
     backend/prisma/schema.prisma:101

  Overall, your schema is decent for a school project, but these three are structural weaknesses evaluators can challenge. The single highest-impact fix is adding DB constraints for Friends (unique pair + controlled status).
