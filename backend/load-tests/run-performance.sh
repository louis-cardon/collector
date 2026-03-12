#!/usr/bin/env bash
set -uo pipefail

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
SCENARIO_STATUS_TSV="${RESULTS_DIR}/scenarios-status.tsv"
RUN_LOG="${RESULTS_DIR}/run.log"

FAILED_SCENARIOS=0
TOTAL_SCENARIOS=0

mkdir -p "${RESULTS_DIR}"
exec > >(tee -a "${RUN_LOG}") 2>&1

log() {
  printf '[%s] %s\n' "$(date -u +"%Y-%m-%d %H:%M:%S UTC")" "$*"
}

extract_metric() {
  local label="$1"
  local file="$2"
  local value lower_label

  lower_label="$(echo "${label}" | tr '[:upper:]' '[:lower:]')"
  value="$(
    sed -E 's/\x1B\[[0-9;]*[[:alpha:]]//g' "${file}" | awk -F ':' -v key="${lower_label}" '
      {
        metric_name=$1
        gsub(/^[[:space:]]+|[[:space:]]+$/, "", metric_name)
        metric_name=tolower(metric_name)

        if (index(metric_name, key) > 0) {
          metric_value=substr($0, index($0, ":") + 1)
          gsub(/^[[:space:]]+|[[:space:]]+$/, "", metric_value)
          print metric_value
          exit
        }
      }
    ' || true
  )"

  if [[ -n "${value}" ]]; then
    echo "${value}"
  else
    echo "n/a"
  fi
}

record_summary() {
  local scenario="$1"
  local exit_code="$2"
  local output_file="$3"
  local availability failed_transactions response_time transaction_rate

  availability="$(extract_metric "Availability" "${output_file}")"
  failed_transactions="$(extract_metric "Failed transactions" "${output_file}")"
  response_time="$(extract_metric "Response time" "${output_file}")"
  transaction_rate="$(extract_metric "Transaction rate" "${output_file}")"

  echo "| ${scenario} | ${exit_code} | ${availability} | ${failed_transactions} | ${response_time} | ${transaction_rate} |" >> "${SUMMARY_MD}"
  echo "${scenario},${exit_code},\"${availability}\",\"${failed_transactions}\",\"${response_time}\",\"${transaction_rate}\"" >> "${SUMMARY_CSV}"
  printf "%s\t%s\t%s\t%s\t%s\t%s\n" "${scenario}" "${exit_code}" "${availability}" "${failed_transactions}" "${response_time}" "${transaction_rate}" >> "${SCENARIO_STATUS_TSV}"
}

mark_failure_if_needed() {
  local scenario="$1"
  local exit_code="$2"

  if [[ "${exit_code}" -ne 0 ]]; then
    FAILED_SCENARIOS=$((FAILED_SCENARIOS + 1))
    log "Scenario failed: ${scenario} (exit code ${exit_code})"
  fi
}

run_siege_and_record() {
  local scenario="$1"
  local display_command="$2"
  shift 2
  local output_file="${RESULTS_DIR}/${scenario}.log"
  local exit_code=0

  TOTAL_SCENARIOS=$((TOTAL_SCENARIOS + 1))
  log "Running scenario: ${scenario}"
  log "Command: ${display_command}"

  siege "$@" > "${output_file}" 2>&1
  exit_code=$?

  log "Scenario ${scenario} finished with exit code ${exit_code}"
  log "Scenario output: ${output_file}"

  if [[ "${exit_code}" -ne 0 ]]; then
    log "Last scenario log lines for ${scenario}:"
    tail -n 40 "${output_file}" || true
  fi

  record_summary "${scenario}" "${exit_code}" "${output_file}"
  mark_failure_if_needed "${scenario}" "${exit_code}"
}

record_non_siege_failure() {
  local scenario="$1"
  local exit_code="$2"
  local message="$3"
  local output_file="${RESULTS_DIR}/${scenario}.log"

  TOTAL_SCENARIOS=$((TOTAL_SCENARIOS + 1))
  printf "%s\n" "${message}" > "${output_file}"
  record_summary "${scenario}" "${exit_code}" "${output_file}"
  mark_failure_if_needed "${scenario}" "${exit_code}"
}

if [[ ! -f "${PUBLIC_ENDPOINTS_FILE}" ]]; then
  log "Missing endpoints file: ${PUBLIC_ENDPOINTS_FILE}"
  exit 1
fi

cat > "${SUMMARY_MD}" <<EOF
# Resultats des tests de charge

- Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
- Base URL: ${BASE_URL}
- Siege users: ${USERS}
- Siege duration: ${DURATION}
- Script log: ${RUN_LOG}

| Scenario | Exit code | Availability | Failed transactions | Response time | Transaction rate |
|---|---:|---:|---:|---:|---:|
EOF

echo 'scenario,exit_code,availability,failed_transactions,response_time,transaction_rate' > "${SUMMARY_CSV}"
printf "scenario\texit_code\tavailability\tfailed_transactions\tresponse_time\ttransaction_rate\n" > "${SCENARIO_STATUS_TSV}"

while IFS= read -r endpoint; do
  if [[ -z "${endpoint}" || "${endpoint}" == \#* ]]; then
    continue
  fi

  scenario_name="get_$(echo "${endpoint}" | tr '/:' '__' | sed 's/^_//')"
  run_siege_and_record \
    "${scenario_name}" \
    "siege -c ${USERS} -t ${DURATION} -b ${BASE_URL}${endpoint}" \
    -c "${USERS}" \
    -t "${DURATION}" \
    -b \
    "${BASE_URL}${endpoint}"
done < "${PUBLIC_ENDPOINTS_FILE}"

LOGIN_PAYLOAD="$(printf '{"email":"%s","password":"%s"}' "${SELLER_EMAIL}" "${SELLER_PASSWORD}")"
run_siege_and_record \
  "post_auth_login" \
  "siege -c ${USERS} -t ${DURATION} -b --content-type application/json ${BASE_URL}/auth/login POST <redacted-json>" \
  -c "${USERS}" \
  -t "${DURATION}" \
  -b \
  --content-type "application/json" \
  "${BASE_URL}/auth/login POST ${LOGIN_PAYLOAD}"

LOGIN_RESPONSE_FILE="${RESULTS_DIR}/login-response.json"
LOGIN_CURL_LOG="${RESULTS_DIR}/login-curl.log"
LOGIN_STATUS_CODE="000"

log "Command: curl -X POST ${BASE_URL}/auth/login (login token retrieval)"
LOGIN_STATUS_CODE="$(
  curl -sS -o "${LOGIN_RESPONSE_FILE}" -w '%{http_code}' \
    -X POST "${BASE_URL}/auth/login" \
    -H 'Content-Type: application/json' \
    -d "${LOGIN_PAYLOAD}" \
    2> "${LOGIN_CURL_LOG}" || echo "000"
)"

log "Login status code for protected scenario bootstrap: ${LOGIN_STATUS_CODE}"

if [[ "${LOGIN_STATUS_CODE}" == "200" ]]; then
  TOKEN="$(
    node -e "const fs=require('fs');const body=fs.readFileSync(process.argv[1],'utf8');try{const parsed=JSON.parse(body);process.stdout.write(parsed.accessToken||'');}catch{}" "${LOGIN_RESPONSE_FILE}"
  )"

  if [[ -n "${TOKEN}" ]]; then
    run_siege_and_record \
      "get_auth_me" \
      "siege -c ${USERS} -t ${DURATION} -b -H 'Authorization: Bearer <token>' ${BASE_URL}/auth/me" \
      -c "${USERS}" \
      -t "${DURATION}" \
      -b \
      -H "Authorization: Bearer ${TOKEN}" \
      "${BASE_URL}/auth/me"
  else
    record_non_siege_failure "get_auth_me" 96 "Token extraction failed from login response."
  fi
else
  record_non_siege_failure "get_auth_me" 97 "Skipping /auth/me siege run because login returned HTTP ${LOGIN_STATUS_CODE}."
fi

log "Campaign finished. Scenarios executed: ${TOTAL_SCENARIOS}, failed: ${FAILED_SCENARIOS}"
log "Summary file: ${SUMMARY_MD}"

if [[ "${FAILED_SCENARIOS}" -gt 0 ]]; then
  log "At least one scenario failed. Returning exit code 1."
  exit 1
fi

log "All scenarios succeeded."
