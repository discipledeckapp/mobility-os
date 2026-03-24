#!/usr/bin/env bash

set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 /path/to/render-setup-template.txt" >&2
  exit 1
fi

TEMPLATE_FILE="$1"

if [ ! -f "$TEMPLATE_FILE" ]; then
  echo "Template file not found: $TEMPLATE_FILE" >&2
  exit 1
fi

API_BASE="https://api.render.com/v1"
RENDER_API_KEY="$(grep '^RENDER_API_KEY=' "$TEMPLATE_FILE" | head -n1 | cut -d= -f2-)"

if [ -z "${RENDER_API_KEY:-}" ]; then
  echo "RENDER_API_KEY not found in template file." >&2
  exit 1
fi

json_escape() {
  node -e 'process.stdout.write(JSON.stringify(process.argv[1]).slice(1, -1))' "$1"
}

service_id_for() {
  local service_name="$1"
  grep "^${service_name} service id=" "$TEMPLATE_FILE" | head -n1 | cut -d= -f2-
}

section_lines() {
  local section_name="$1"
  awk -v section="[$section_name]" '
    $0 == section { in_section=1; next }
    /^\[/ { in_section=0 }
    in_section { print }
  ' "$TEMPLATE_FILE" | sed '/^[[:space:]]*$/d'
}

update_env_var() {
  local service_id="$1"
  local key="$2"
  local value="$3"
  local payload

  payload=$(printf '{"value":"%s"}' "$(json_escape "$value")")

  curl -fsS \
    -X PUT \
    -H "Authorization: Bearer ${RENDER_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "${API_BASE}/services/${service_id}/env-vars/${key}" >/dev/null
}

trigger_deploy() {
  local service_id="$1"
  curl -fsS \
    -X POST \
    -H "Authorization: Bearer ${RENDER_API_KEY}" \
    "${API_BASE}/services/${service_id}/deploys" >/dev/null
}

process_service_section() {
  local service_name="$1"
  local section_name="$2"
  local service_id
  local updated=0

  service_id="$(service_id_for "$service_name")"
  if [ -z "${service_id:-}" ]; then
    echo "Skipping ${service_name}: no service id provided."
    return 0
  fi

  echo "Updating ${service_name} (${service_id})..."

  while IFS= read -r line; do
    case "$line" in
      *=*)
        local key="${line%%=*}"
        local value="${line#*=}"
        if [ -n "$key" ] && [ -n "$value" ]; then
          update_env_var "$service_id" "$key" "$value"
          updated=1
          echo "  set ${key}"
        fi
        ;;
    esac
  done < <(section_lines "$section_name")

  if [ "$updated" -eq 1 ]; then
    echo "  triggering deploy"
    trigger_deploy "$service_id"
  fi
}

process_service_section "api-core" "api-core"
process_service_section "api-control-plane" "api-control-plane"
process_service_section "api-intelligence" "api-intelligence"
process_service_section "tenant-web" "tenant-web"
process_service_section "control-plane-web" "control-plane-web"

echo "Done."
