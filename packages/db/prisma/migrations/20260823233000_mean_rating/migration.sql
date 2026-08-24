-- Recalculate stored averages as a plain mean of published star ratings.
-- Histogram stays as-is and is rebuilt on the next review write.

UPDATE "MasterStats" AS stats
SET
  "ratingAvg" = sub.avg,
  "ratingCount" = sub.cnt,
  "recalculatedAt" = NOW()
FROM (
  SELECT
    "masterId",
    ROUND(AVG(rating)::numeric, 2) AS avg,
    COUNT(*)::int AS cnt
  FROM "Review"
  WHERE "authorRole" = 'client'
    AND status = 'published'
    AND rating IS NOT NULL
  GROUP BY "masterId"
) AS sub
WHERE stats."masterId" = sub."masterId";

UPDATE "ClientProfile" AS profile
SET
  "ratingAvg" = sub.avg,
  "ratingCount" = sub.cnt
FROM (
  SELECT
    "clientUserId",
    ROUND(AVG(rating)::numeric, 2) AS avg,
    COUNT(*)::int AS cnt
  FROM "Review"
  WHERE "authorRole" = 'master'
    AND status = 'published'
    AND rating IS NOT NULL
  GROUP BY "clientUserId"
) AS sub
WHERE profile."userId" = sub."clientUserId";
