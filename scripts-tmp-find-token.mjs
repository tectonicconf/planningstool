import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const envText = readFileSync(
  "/Users/kaat/Desktop/Tectonic/planningstool/.env.local",
  "utf8",
);
const env = {};
for (const line of envText.split("\n")) {
  const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
}

const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or service role key in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

const { data: assignments, error: aErr } = await supabase
  .from("assignments")
  .select("volunteer_id, status")
  .in("status", ["pending", "confirmed"]);

if (aErr) {
  console.error("assignments error:", aErr.message);
  process.exit(1);
}

const byVolunteer = new Map();
for (const a of assignments) {
  const set = byVolunteer.get(a.volunteer_id) ?? new Set();
  set.add(a.status);
  byVolunteer.set(a.volunteer_id, set);
}

let targetId = null;
for (const [id, statuses] of byVolunteer) {
  if (statuses.has("pending") && statuses.has("confirmed")) {
    targetId = id;
    break;
  }
}
if (!targetId) {
  targetId = byVolunteer.keys().next().value;
}

const { data: volunteer, error: vErr } = await supabase
  .from("volunteers")
  .select("magic_link_token, first_name")
  .eq("id", targetId)
  .maybeSingle();

if (vErr || !volunteer) {
  console.error("volunteer lookup failed:", vErr?.message);
  process.exit(1);
}

console.log("TOKEN=" + volunteer.magic_link_token);
console.log("NAME=" + volunteer.first_name);
console.log("STATUSES=" + [...(byVolunteer.get(targetId) ?? [])].join(","));
