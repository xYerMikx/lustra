#!/usr/bin/env bash
# Local curl smoke for auth API (cookie jar + CSRF).
# Smoke emails: {role}.smoke.{runId}@example.com — see .cursor/rules/lumira-smoke-data.mdc
# Postman collections: workspace via MCP — not in git (.cursor/rules/lumira-postman.mdc).
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3333}"
JAR="$(mktemp)"
trap 'rm -f "$JAR"' EXIT

PASS='Password1!'
STAMP="$(date +%s)"
CLIENT_EMAIL="client.smoke.${STAMP}@example.com"
MASTER_EMAIL="master.smoke.${STAMP}@example.com"
FAIL=0

assert_status() {
  local name="$1" expected="$2" actual="$3"
  if [[ "$actual" == "$expected" ]]; then
    echo "PASS  $name ($actual)"
  else
    echo "FAIL  $name (expected $expected, got $actual)"
    FAIL=1
  fi
}

csrf_from_jar() {
  # cookie jar Netscape format: domain ... name value
  awk '$6=="lumira_csrf" {print $7; exit}' "$JAR"
}

echo "== Lumira auth smoke @ ${BASE_URL} =="

code="$(curl -sS -o /tmp/lumira-health.json -w '%{http_code}' "${BASE_URL}/health")"
assert_status 'health' 200 "$code"

code="$(curl -sS -o /tmp/lumira-me.json -w '%{http_code}' "${BASE_URL}/auth/me")"
assert_status 'me unauth' 401 "$code"

code="$(curl -sS -o /tmp/lumira-refresh.json -w '%{http_code}' -X POST "${BASE_URL}/auth/refresh")"
assert_status 'refresh without csrf' 403 "$code"

code="$(curl -sS -c "$JAR" -b "$JAR" -o /tmp/lumira-reg-client.json -w '%{http_code}' \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${CLIENT_EMAIL}\",\"password\":\"${PASS}\",\"firstName\":\"Клиент\",\"role\":\"client\",\"acceptTerms\":true}" \
  "${BASE_URL}/auth/register")"
assert_status 'register client' 201 "$code"
role="$(python3 -c 'import json;print(json.load(open("/tmp/lumira-reg-client.json"))["user"]["role"])')"
[[ "$role" == "client" ]] && echo "PASS  register client role" || { echo "FAIL  register client role ($role)"; FAIL=1; }

code="$(curl -sS -c "$JAR" -b "$JAR" -o /tmp/lumira-me.json -w '%{http_code}' "${BASE_URL}/auth/me")"
assert_status 'me client' 200 "$code"

code="$(curl -sS -c "$JAR" -b "$JAR" -o /tmp/lumira-logout.json -w '%{http_code}' -X POST "${BASE_URL}/auth/logout")"
assert_status 'logout without csrf' 403 "$code"

CSRF="$(csrf_from_jar)"
code="$(curl -sS -c "$JAR" -b "$JAR" -o /tmp/lumira-logout.json -w '%{http_code}' \
  -H "X-CSRF-Token: ${CSRF}" -X POST "${BASE_URL}/auth/logout")"
assert_status 'logout with csrf' 204 "$code"

code="$(curl -sS -c "$JAR" -b "$JAR" -o /tmp/lumira-me.json -w '%{http_code}' "${BASE_URL}/auth/me")"
assert_status 'me after logout' 401 "$code"

code="$(curl -sS -c "$JAR" -b "$JAR" -o /tmp/lumira-reg-master.json -w '%{http_code}' \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${MASTER_EMAIL}\",\"password\":\"${PASS}\",\"firstName\":\"Мастер\",\"role\":\"master\",\"acceptTerms\":true}" \
  "${BASE_URL}/auth/register")"
assert_status 'register master' 201 "$code"
python3 - <<'PY' || FAIL=1
import json
u=json.load(open("/tmp/lumira-reg-master.json"))["user"]
assert u["role"]=="master" and u["profileStatus"]=="draft" and u["emailVerified"] is False, u
print("PASS  register master draft")
PY

code="$(curl -sS -c "$JAR" -b "$JAR" -o /tmp/lumira-email-resend.json -w '%{http_code}' \
  -X POST "${BASE_URL}/auth/email/resend")"
assert_status 'email resend' 200 "$code"

code="$(curl -sS -o /tmp/lumira-email-verify-bad.json -w '%{http_code}' \
  -H 'Content-Type: application/json' \
  -d '{"token":"not-a-real-token"}' \
  "${BASE_URL}/auth/email/verify")"
assert_status 'verify invalid token' 409 "$code"

code="$(curl -sS -c "$JAR" -b "$JAR" -o /tmp/lumira-login.json -w '%{http_code}' \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${CLIENT_EMAIL}\",\"password\":\"${PASS}\"}" \
  "${BASE_URL}/auth/login")"
assert_status 'login client' 200 "$code"
CSRF="$(csrf_from_jar)"
OLD_REFRESH="$(awk '$6=="lumira_refresh" {print $7; exit}' "$JAR")"

code="$(curl -sS -o /tmp/lumira-login-bad.json -w '%{http_code}' \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${CLIENT_EMAIL}\",\"password\":\"WrongPass1!\"}" \
  "${BASE_URL}/auth/login")"
assert_status 'login wrong password' 401 "$code"

code="$(curl -sS -c "$JAR" -b "$JAR" -o /tmp/lumira-refresh.json -w '%{http_code}' \
  -H "X-CSRF-Token: ${CSRF}" -X POST "${BASE_URL}/auth/refresh")"
assert_status 'refresh with csrf' 200 "$code"
CSRF="$(csrf_from_jar)"
NEW_REFRESH="$(awk '$6=="lumira_refresh" {print $7; exit}' "$JAR")"
[[ "$OLD_REFRESH" != "$NEW_REFRESH" ]] && echo "PASS  refresh rotated token" || { echo "FAIL  refresh did not rotate"; FAIL=1; }

# Reuse old refresh cookie intentionally
code="$(curl -sS -o /tmp/lumira-reuse.json -w '%{http_code}' \
  -H "Cookie: lumira_refresh=${OLD_REFRESH}; lumira_csrf=${CSRF}" \
  -H "X-CSRF-Token: ${CSRF}" -X POST "${BASE_URL}/auth/refresh")"
assert_status 'refresh reuse old token' 401 "$code"

MIXED="$(printf '%s' "$CLIENT_EMAIL" | tr '[:lower:]' '[:upper:]')"
code="$(curl -sS -o /tmp/lumira-dup.json -w '%{http_code}' \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${MIXED}\",\"password\":\"${PASS}\",\"firstName\":\"Case\",\"role\":\"client\",\"acceptTerms\":true}" \
  "${BASE_URL}/auth/register")"
assert_status 'email normalize conflict' 400 "$code"

code="$(curl -sS -o /tmp/lumira-forgot-unknown.json -w '%{http_code}' \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"nobody.smoke.${STAMP}@example.com\"}" \
  "${BASE_URL}/auth/password/forgot")"
assert_status 'forgot unknown email' 200 "$code"

code="$(curl -sS -o /tmp/lumira-forgot-known.json -w '%{http_code}' \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${CLIENT_EMAIL}\"}" \
  "${BASE_URL}/auth/password/forgot")"
assert_status 'forgot known email' 200 "$code"

code="$(curl -sS -o /tmp/lumira-reset-bad.json -w '%{http_code}' \
  -H 'Content-Type: application/json' \
  -d '{"token":"not-a-real-token","password":"Password2!"}' \
  "${BASE_URL}/auth/password/reset")"
assert_status 'reset invalid token' 409 "$code"

if [[ "$FAIL" -ne 0 ]]; then
  echo "== FAILED =="
  exit 1
fi
echo "== ALL PASSED =="
