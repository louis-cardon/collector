#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:3001}"
USERS="${2:-20}"
DURATION="${3:-30S}"

RESULTS_DIR="${RESULTS_DIR:-load-test-results}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLIC_ENDPOINTS_FILE="${SCRIPT_DIR}/endpoints-public.txt"

SELLER_EMAIL="${SELLER_EMAIL:-seller@collector.local}"
SELLER_PASSWORD="${SELLER_PASSWORD:-Seller123!}"

SUMMARY_MD="${RESULTS_DIR}/summary.md"
SUMMARY_CSV="${RESULTS_DIR}/summary.csv"

mkdir -p "${RESULTS_DIR}"

cat > "${SUMMARY_MD}" <<EOF
# Resultats des tests de charge

- Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
- Base URL: ${BASE_URL}
- Siege users: ${USERS}
- Siege duration: ${DURATION}

| Scenario | Availability | Response time | Transaction rate | Failed transactions | Longest transaction |
|---|---:|---:|---:|---:|---:|
EOF

echo 'scenario,availability,response_time,transaction_rate,failed_transactions,longest_transaction' > "${SUMMARY_CSV}"

extract_metric() {
  local label="$1"
  local file="$2"
  grep -E "^${label}:" "${file}" | head -n1 | sed -E "s/^${label}:[[:space:]]*//" | xargs
}

append_summary_line() {
  local scenario="$1"
  local file="$2"
  local availability response_time transaction_rate failed_transactions longest_transaction

  availability="$(extract_metric "Availability" "${file}")"
  response_time="$(extract_metric "Response time" "${file}")"
  transaction_rate="$(extract_metric "Transaction rate" "${file}")"
  failed_transactions="$(extract_metric "Failed transactions" "${file}")"
  longest_transaction="$(extract_metric "Longest transaction" "${file}")"

  echo "| ${scenario} | ${availability:-n/a} | ${response_time:-n/a} | ${transaction_rate:-n/a} | ${failed_transactions:-n/a} | ${longest_transaction:-n/a} |" >> "${SUMMARY_MD}"
  echo "${scenario},\"${availability:-n/a}\",\"${response_time:-n/a}\",\"${transaction_rate:-n/a}\",\"${failed_transactions:-n/a}\",\"${longest_transaction:-n/a}\"" >> "${SUMMARY_CSV}"
}

run_siege_and_record() {
  local scenario="$1"
  shift
  local output_file="${RESULTS_DIR}/${scenario}.log"

  echo "Running scenario: ${scenario}"
  if ! siege "$@" > "${output_file}" 2>&1; then
    echo "Siege returned a non-zero exit code for ${scenario}. Metrics are still collected."
  fi

  append_summary_line "${scenario}" "${output_file}"
}

if [[ ! -f "${PUBLIC_ENDPOINTS_FILE}" ]]; then
  echo "Missing endpoints file: ${PUBLIC_ENDPOINTS_FILE}" >&2
  exit 1
fi

while IFS= read -r endpoint; do
  if [[ -z "${endpoint}" || "${endpoint}" == \#* ]]; then
    continue
  fi
  scenario_name="get_$(echo "${endpoint}" | tr '/:' '__' | sed 's/^_//')"
  run_siege_and_record "${scenario_name}" -c "${USERS}" -t "${DURATION}" -b "${BASE_URL}${endpoint}"
done < "${PUBLIC_ENDPOINTS_FILE}"

LOGIN_PAYLOAD="$(printf '{"email":"%s","password":"%s"}' "${SELLER_EMAIL}" "${SELLER_PASSWORD}")"
run_siege_and_record \
  "post_auth_login" \
  -c "${USERS}" \
  -t "${DURATION}" \
  -b \
  --content-type "application/json" \
  "${BASE_URL}/auth/login POST ${LOGIN_PAYLOAD}"

LOGIN_RESPONSE_FILE="${RESULTS_DIR}/login-response.json"
LOGIN_STATUS_CODE="$(
  curl -sS -o "${LOGIN_RESPONSE_FILE}" -w '%{http_code}' \
    -X POST "${BASE_URL}/auth/login" \
    -H 'Content-Type: application/json' \
    -d "${LOGIN_PAYLOAD}"
)"

if [[ "${LOGIN_STATUS_CODE}" == "200" ]]; then
  TOKEN="$(
    node -e "const fs=require('fs');const body=fs.readFileSync(process.argv[1],'utf8');try{const parsed=JSON.parse(body);process.stdout.write(parsed.accessToken||'');}catch{}" "${LOGIN_RESPONSE_FILE}"
  )"

  if [[ -n "${TOKEN}" ]]; then
    run_siege_and_record \
      "get_auth_me" \
      -c "${USERS}" \
      -t "${DURATION}" \
      -b \
      -H "Authorization: Bearer ${TOKEN}" \
      "${BASE_URL}/auth/me"
  else
    echo "Skipping protected scenario: no access token extracted." | tee -a "${SUMMARY_MD}"
  fi
else
  echo "Skipping protected scenario: login failed with HTTP ${LOGIN_STATUS_CODE}." | tee -a "${SUMMARY_MD}"
fi

echo
echo "Performance campaign finished. Summary: ${SUMMARY_MD}"
