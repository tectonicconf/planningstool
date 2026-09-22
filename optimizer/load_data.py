from pathlib import Path
from datetime import datetime
import csv


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).parent
INPUT_DIR = BASE_DIR / "input"
OUTPUT_DIR = BASE_DIR / "output"

OUTPUT_DIR.mkdir(exist_ok=True)

VOLUNTEERS_FILE = INPUT_DIR / "volunteers.csv"
SHIFTS_FILE = INPUT_DIR / "shifts.csv"


# ============================================================
# CONFIGURATION
# ============================================================

# Central definition of the availability slots used in Tally.
TIME_SLOTS = {
    "Morning": {
        "start": "07:00",
        "end": "13:00",
        "order": 1,
    },
    "Afternoon": {
        "start": "13:00",
        "end": "18:00",
        "order": 2,
    },
    "Evening": {
        "start": "18:00",
        "end": "23:59",
        "order": 3,
    },
}


ROLE_CATEGORIES = [
    "Setup & Logistics",
    "Technical Support",
    "Guest Flow & Stewarding",
    "Info & Welcome",
    "Food & Drinks",
    "Runner & Flexible Support",
    "Stage & Session Support",
]


# Exact Tally availability labels -> date + slot
AVAILABILITY_OPTIONS = {
    "October 20 - Morning (Hackathon or Setup)": (
        "2026-10-20",
        "Morning",
    ),
    "October 20 - Afternoon (Hackathon or Setup)": (
        "2026-10-20",
        "Afternoon",
    ),
    "October 20 - Evening (Hackathon or Setup)": (
        "2026-10-20",
        "Evening",
    ),
    "October 21 - Morning": (
        "2026-10-21",
        "Morning",
    ),
    "October 21 - Afternoon": (
        "2026-10-21",
        "Afternoon",
    ),
    "October 21 - Evening": (
        "2026-10-21",
        "Evening",
    ),
    "October 22 - Morning (Breakdown)": (
        "2026-10-22",
        "Morning",
    ),
}


# ============================================================
# HELPERS
# ============================================================

def parse_bool(value):
    """
    Convert checkbox / yes-no values from Tally to bool.
    """

    if not value:
        return False

    return value.strip().lower() in {
        "yes",
        "true",
        "1",
        "checked",
    }


def parse_time(value):
    """
    '07:00' -> datetime.time(7, 0)
    """

    return datetime.strptime(
        value.strip(),
        "%H:%M"
    ).time()


def parse_desired_shifts(value):
    """
    Convert the Tally answer into a value that is easier
    for the optimizer to use.

    1             -> 1
    2             -> 2
    3             -> 3
    4+            -> "more"
    No preference -> "indifferent"
    """

    value = value.strip().lower()

    if value in {"1", "2", "3"}:
        return int(value)

    if value in {"4+", "more"}:
        return "more"

    if value in {
        "no preference",
        "indifferent",
    }:
        return "indifferent"

    raise ValueError(
        f"Unknown desired shifts value: '{value}'"
    )


# ============================================================
# LOAD VOLUNTEERS FROM RAW TALLY EXPORT
# ============================================================

def load_volunteers():
    """
    Load the raw Tally CSV and transform it into:

    volunteers
    availability
    role_preferences
    """

    volunteers = {}
    availability = set()
    role_preferences = set()

    with open(
        VOLUNTEERS_FILE,
        newline="",
        encoding="utf-8-sig",
    ) as file:

        # Tally export uses ;
        reader = csv.DictReader(
            file,
            delimiter=";"
        )

        for index, row in enumerate(
            reader,
            start=1
        ):

            # --------------------------------------------
            # VOLUNTEER ID
            # --------------------------------------------

            # Use Tally's Submission ID when available.
            # Fallback makes fake/test data robust.
            volunteer_id = (
                row.get("Submission ID", "").strip()
                or f"V{index:03d}"
            )

            if volunteer_id in volunteers:
                raise ValueError(
                    f"Duplicate volunteer ID: "
                    f"{volunteer_id}"
                )

            # --------------------------------------------
            # GENERAL VOLUNTEER DATA
            # --------------------------------------------

            volunteers[volunteer_id] = {
                "id": volunteer_id,

                "first_name": row.get(
                    "First Name",
                    ""
                ).strip(),

                "last_name": row.get(
                    "Last Name",
                    ""
                ).strip(),

                "email": row.get(
                    "Email",
                    ""
                ).strip(),

                "phone_number": row.get(
                    "Phone",
                    ""
                ).strip(),

                "association": row.get(
                    "What organisation?",
                    ""
                ).strip(),

                "wants_responsibility": parse_bool(
                    row.get(
                        "Would you be interested in taking on a "
                        "volunteer role with a little more "
                        "responsibility?",
                        ""
                    )
                ),

                "desired_shifts": parse_desired_shifts(
                    row.get(
                        "How many shifts would you be willing "
                        "to take on during Tectonic?",
                        ""
                    )
                ),

                # Backup is NOT a Tally answer.
                # New volunteers start as non-backup.
                "is_backup": False,
            }

            # --------------------------------------------
            # ROLE PREFERENCES
            # --------------------------------------------

            for role in ROLE_CATEGORIES:

                column = (
                    "What kind of shifts would you feel "
                    f"comfortable doing? ({role})"
                )

                if parse_bool(
                    row.get(column, "")
                ):
                    role_preferences.add(
                        (
                            volunteer_id,
                            role
                        )
                    )

            # --------------------------------------------
            # AVAILABILITY
            # --------------------------------------------

            for label, (
                date,
                slot
            ) in AVAILABILITY_OPTIONS.items():

                column = (
                    "When would you be available to help "
                    f"out at Tectonic? ({label})"
                )

                # Some Tally exports can contain accidental
                # whitespace in headers, so search stripped
                # column names if necessary.
                value = row.get(column)

                if value is None:
                    for key, cell_value in row.items():

                        if (
                            key is not None
                            and key.strip() == column
                        ):
                            value = cell_value
                            break

                if parse_bool(value):

                    availability.add(
                        (
                            volunteer_id,
                            date,
                            slot
                        )
                    )

    return (
        volunteers,
        availability,
        role_preferences,
    )


# ============================================================
# LOAD SHIFTS
# ============================================================

def load_shifts():

    shifts = {}

    with open(
        SHIFTS_FILE,
        newline="",
        encoding="utf-8-sig",
    ) as file:

        reader = csv.DictReader(file)

        for row in reader:

            shift_id = row["id"].strip()

            if shift_id in shifts:
                raise ValueError(
                    f"Duplicate shift ID: {shift_id}"
                )

            shifts[shift_id] = {
                "id": shift_id,

                "date": row[
                    "date"
                ].strip(),

                "day": row[
                    "day"
                ].strip(),

                "slot": row[
                    "slot"
                ].strip(),

                "start_time": parse_time(
                    row["start_time"]
                ),

                "end_time": parse_time(
                    row["end_time"]
                ),

                "hours": float(
                    row["hours"]
                ),

                "venue": row[
                    "venue"
                ].strip(),

                "location": row[
                    "location"
                ].strip(),

                "role_category": row[
                    "role_category"
                ].strip(),

                "volunteers_needed": int(
                    row["volunteers_needed"]
                ),

                "event_context": row[
                    "event_context"
                ].strip(),
            }

    return shifts


# ============================================================
# VALIDATION
# ============================================================

def validate_data(
    volunteers,
    availability,
    role_preferences,
    shifts,
):

    # Availability must reference existing volunteers
    for volunteer_id, date, slot in availability:

        if volunteer_id not in volunteers:
            raise ValueError(
                f"Availability references unknown "
                f"volunteer: {volunteer_id}"
            )

        if slot not in TIME_SLOTS:
            raise ValueError(
                f"Unknown availability slot: {slot}"
            )

    # Preferences must reference existing volunteers
    for volunteer_id, role in role_preferences:

        if volunteer_id not in volunteers:
            raise ValueError(
                f"Role preference references unknown "
                f"volunteer: {volunteer_id}"
            )

        if role not in ROLE_CATEGORIES:
            raise ValueError(
                f"Unknown role category: {role}"
            )

    # Validate shifts
    for shift_id, shift in shifts.items():

        if shift["slot"] not in TIME_SLOTS:
            raise ValueError(
                f"Shift {shift_id} has unknown slot: "
                f"{shift['slot']}"
            )

        if (
            shift["role_category"]
            not in ROLE_CATEGORIES
        ):
            raise ValueError(
                f"Shift {shift_id} has unknown role: "
                f"{shift['role_category']}"
            )

        if shift["volunteers_needed"] < 0:
            raise ValueError(
                f"Shift {shift_id} has negative capacity."
            )


# ============================================================
# AVAILABILITY FOR A SPECIFIC SHIFT
# ============================================================

def volunteer_available_for_shift(
    volunteer_id,
    shift,
    availability,
):
    """
    A volunteer must:

    1. Have selected the corresponding date + slot.
    2. Be available for the complete shift duration.
    """

    availability_key = (
        volunteer_id,
        shift["date"],
        shift["slot"],
    )

    if availability_key not in availability:
        return False

    slot = TIME_SLOTS[
        shift["slot"]
    ]

    slot_start = parse_time(
        slot["start"]
    )

    slot_end = parse_time(
        slot["end"]
    )

    return (
        shift["start_time"] >= slot_start
        and
        shift["end_time"] <= slot_end
    )


# ============================================================
# ROLE PREFERENCE
# ============================================================

def volunteer_prefers_shift(
    volunteer_id,
    shift,
    role_preferences,
):
    """
    This is NOT a hard constraint.

    False means OR-Tools may still assign the volunteer,
    but we can give preferred assignments a bonus in
    the objective function.
    """

    return (
        volunteer_id,
        shift["role_category"]
    ) in role_preferences


# ============================================================
# LOAD EVERYTHING
# ============================================================

def load_all_data():

    (
        volunteers,
        availability,
        role_preferences,
    ) = load_volunteers()

    shifts = load_shifts()

    validate_data(
        volunteers,
        availability,
        role_preferences,
        shifts,
    )

    return {
        "volunteers": volunteers,
        "availability": availability,
        "role_preferences": role_preferences,
        "shifts": shifts,
        "time_slots": TIME_SLOTS,
    }


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    data = load_all_data()

    print("Data loaded successfully.")
    print()

    print(
        f"Volunteers: "
        f"{len(data['volunteers'])}"
    )

    print(
        f"Availability records: "
        f"{len(data['availability'])}"
    )

    print(
        f"Role preferences: "
        f"{len(data['role_preferences'])}"
    )

    print(
        f"Shifts: "
        f"{len(data['shifts'])}"
    )

    # Show one volunteer as a sanity check
    first_volunteer_id = next(
        iter(data["volunteers"])
    )

    print()
    print("Example volunteer:")
    print(
        data["volunteers"][
            first_volunteer_id
        ]
    )

    print()
    print("Availability:")

    for record in sorted(
        data["availability"]
    ):
        if record[0] == first_volunteer_id:
            print(record)

    print()
    print("Preferred roles:")

    for record in sorted(
        data["role_preferences"]
    ):
        if record[0] == first_volunteer_id:
            print(record)