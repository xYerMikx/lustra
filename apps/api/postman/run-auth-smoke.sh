#!/usr/bin/env bash
# Local curl smoke for auth API (cookie jar + CSRF).
# Source of truth for Postman collections: Postman workspace via MCP — do not
# reintroduce *.postman_collection.json into git (see .cursor/rules/lustra-postman.mdc).
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
  awk '$6=="lustra_csrf" {print $7; exit}' "$JAR"
}

echo "== Lustra auth smoke @ ${BASE_URL} =="

code="$(curl -sS -o /tmp/lustra-health.json -w '%{http_code}' "${BASE_URL}/health")"
assert_status 'health' 200 "$code"

code="$(curl -sS -o /tmp/lustra-me.json -w '%{http_code}' "${BASE_URL}/auth/me")"
assert_status 'me unauth' 401 "$code"

code="$(curl -sS -o /tmp/lustra-refresh.json -w '%{http_code}' -X POST "${BASE_URL}/auth/refresh")"
assert_status 'refresh without csrf' 403 "$code"

code="$(curl -sS -c "$JAR" -b "$JAR" -o /tmp/lustra-reg-client.json -w '%{http_code}' \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${CLIENT_EMAIL}\",\"password\":\"${PASS}\",\"firstName\":\"Клиент\",\"role\":\"client\",\"acceptTerms\":true}" \
  "${BASE_URL}/auth/register")"
assert_status 'register client' 201 "$code"
role="$(python3 -c 'import json;print(json.load(open("/tmp/lustra-reg-client.json"))["user"]["role"])')"
[[ "$role" == "client" ]] && echo "PASS  register client role" || { echo "FAIL  register client role ($role)"; FAIL=1; }

code="$(curl -sS -c "$JAR" -b "$JAR" -o /tmp/lustra-me.json -w '%{http_code}' "${BASE_URL}/auth/me")"
assert_status 'me client' 200 "$code"

code="$(curl -sS -c "$JAR" -b "$JAR" -o /tmp/lustra-logout.json -w '%{http_code}' -X POST "${BASE_URL}/auth/logout")"
assert_status 'logout without csrf' 403 "$code"

CSRF="$(csrf_from_jar)"
code="$(curl -sS -c "$JAR" -b "$JAR" -o /tmp/lustra-logout.json -w '%{http_code}' \
  -H "X-CSRF-Token: ${CSRF}" -X POST "${BASE_URL}/auth/logout")"
assert_status 'logout with csrf' 204 "$code"

code="$(curl -sS -c "$JAR" -b "$JAR" -o /tmp/lustra-me.json -w '%{http_code}' "${BASE_URL}/auth/me")"
assert_status 'me after logout' 401 "$code"

code="$(curl -sS -c "$JAR" -b "$JAR" -o /tmp/lustra-reg-master.json -w '%{http_code}' \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${MASTER_EMAIL}\",\"password\":\"${PASS}\",\"firstName\":\"Мастер\",\"role\":\"master\",\"acceptTerms\":true}" \
  "${BASE_URL}/auth/register")"
assert_status 'register master' 201 "$code"
python3 - <<'PY' || FAIL=1
import json
u=json.load(open("/tmp/lustra-reg-master.json"))["user"]
assert u["role"]=="master" and u["profileStatus"]=="draft", u
print("PASS  register master draft")
PY

code="$(curl -sS -c "$JAR" -b "$JAR" -o /tmp/lustra-login.json -w '%{http_code}' \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${CLIENT_EMAIL}\",\"password\":\"${PASS}\"}" \
  "${BASE_URL}/auth/login")"
assert_status 'login client' 200 "$code"
CSRF="$(csrf_from_jar)"
OLD_REFRESH="$(awk '$6=="lustra_refresh" {print $7; exit}' "$JAR")"

code="$(curl -sS -o /tmp/lustra-login-bad.json -w '%{http_code}' \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${CLIENT_EMAIL}\",\"password\":\"WrongPass1!\"}" \
  "${BASE_URL}/auth/login")"
assert_status 'login wrong password' 401 "$code"

code="$(curl -sS -c "$JAR" -b "$JAR" -o /tmp/lustra-refresh.json -w '%{http_code}' \
  -H "X-CSRF-Token: ${CSRF}" -X POST "${BASE_URL}/auth/refresh")"
assert_status 'refresh with csrf' 200 "$code"
CSRF="$(csrf_from_jar)"
NEW_REFRESH="$(awk '$6=="lustra_refresh" {print $7; exit}' "$JAR")"
[[ "$OLD_REFRESH" != "$NEW_REFRESH" ]] && echo "PASS  refresh rotated token" || { echo "FAIL  refresh did not rotate"; FAIL=1; }

# Reuse old refresh cookie intentionally
code="$(curl -sS -o /tmp/lustra-reuse.json -w '%{http_code}' \
  -H "Cookie: lustra_refresh=${OLD_REFRESH}; lustra_csrf=${CSRF}" \
  -H "X-CSRF-Token: ${CSRF}" -X POST "${BASE_URL}/auth/refresh")"
assert_status 'refresh reuse old token' 401 "$code"

MIXED="$(printf '%s' "$CLIENT_EMAIL" | tr '[:lower:]' '[:upper:]')"
code="$(curl -sS -o /tmp/lustra-dup.json -w '%{http_code}' \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${MIXED}\",\"password\":\"${PASS}\",\"firstName\":\"Case\",\"role\":\"client\",\"acceptTerms\":true}" \
  "${BASE_URL}/auth/register")"
assert_status 'email normalize conflict' 400 "$code"

if [[ "$FAIL" -ne 0 ]]; then
  echo "== FAILED =="
  exit 1
fi
echo "== ALL PASSED =="
