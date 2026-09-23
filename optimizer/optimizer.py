from pathlib import Path
import csv

from ortools.sat.python import cp_model

from load_data import (
    load_all_data,
    volunteer_available_for_shift,
    volunteer_prefers_shift,
    write_volunteers_csv,
    write_shifts_csv,
)


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).parent
OUTPUT_DIR = BASE_DIR / "output"

OUTPUT_DIR.mkdir(exist_ok=True)

ASSIGNMENTS_FILE = OUTPUT_DIR / "assignments.csv"


# ------------------------------------------------------------
# OBJECTIVE WEIGHTS
# ------------------------------------------------------------
#
# Filling shifts is solved as its own phase below (see PHASE 1 /
# PHASE 2), so it always wins over preferences, no matter what
# these weights are set to. These only break ties *among*
# schedules that already fill the maximum number of positions.
#
# Higher weight = more important to the optimizer.

ROLE_PREFERENCE_WEIGHT = 10
DESIRED_SHIFT_WEIGHT = 15


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def times_overlap(shift_a, shift_b):
    """
    Check whether two shifts overlap.

    Shifts on different dates never overlap.

    Example:

        09:00 ----- 13:00
                   13:00 ----- 17:00

    These do NOT overlap.
    """

    if shift_a["date"] != shift_b["date"]:
        return False

    return (
        shift_a["start_time"] < shift_b["end_time"]
        and
        shift_b["start_time"] < shift_a["end_time"]
    )


def get_target_shift_count(volunteer):
    """
    Convert desired_shifts to a numerical target.

    1 / 2 / 3:
        Try to give exactly this number.

    "more":
        Treat 4 as the initial target.

    "indifferent":
        No target.
    """

    desired = volunteer["desired_shifts"]

    if isinstance(desired, int):
        return desired

    if desired == "more":
        return 4

    if desired == "indifferent":
        return None

    return None


# ============================================================
# OPTIMIZER
# ============================================================

def optimize():

    # --------------------------------------------------------
    # LOAD DATA
    # --------------------------------------------------------

    data = load_all_data()

    volunteers = data["volunteers"]
    shifts = data["shifts"]
    availability = data["availability"]
    role_preferences = data["role_preferences"]

    volunteer_ids = list(volunteers.keys())
    shift_ids = list(shifts.keys())

    # Cleaned, Supabase-ready volunteers/shifts exports. These
    # don't depend on the solve below, so they're written as
    # soon as the source data is loaded.
    write_volunteers_csv(volunteers, availability, role_preferences)
    write_shifts_csv(shifts)

    print()
    print("Building optimization model...")
    print(f"Volunteers: {len(volunteer_ids)}")
    print(f"Shifts: {len(shift_ids)}")

    # --------------------------------------------------------
    # CREATE MODEL
    # --------------------------------------------------------

    model = cp_model.CpModel()

    # x[v, s] = 1 if volunteer v works shift s
    x = {}

    for volunteer_id in volunteer_ids:
        for shift_id in shift_ids:

            x[volunteer_id, shift_id] = (
                model.NewBoolVar(
                    f"x_{volunteer_id}_{shift_id}"
                )
            )

    # ========================================================
    # HARD CONSTRAINT 1
    # AVAILABILITY
    # ========================================================

    for volunteer_id in volunteer_ids:

        for shift_id in shift_ids:

            shift = shifts[shift_id]

            if not volunteer_available_for_shift(
                volunteer_id,
                shift,
                availability,
            ):

                model.Add(
                    x[volunteer_id, shift_id] == 0
                )

    # ========================================================
    # HARD CONSTRAINT 2
    # SHIFT CAPACITY
    # ========================================================

    for shift_id in shift_ids:

        required = shifts[
            shift_id
        ]["volunteers_needed"]

        model.Add(
            sum(
                x[volunteer_id, shift_id]
                for volunteer_id in volunteer_ids
            )
            <= required
        )

    # Notice:
    #
    # <= instead of ==
    #
    # This means the model still produces a schedule if there
    # aren't enough volunteers to completely fill every shift.

    # ========================================================
    # HARD CONSTRAINT 3
    # NO OVERLAPPING SHIFTS
    # ========================================================

    for i in range(len(shift_ids)):

        shift_id_a = shift_ids[i]
        shift_a = shifts[shift_id_a]

        for j in range(i + 1, len(shift_ids)):

            shift_id_b = shift_ids[j]
            shift_b = shifts[shift_id_b]

            if times_overlap(
                shift_a,
                shift_b,
            ):

                for volunteer_id in volunteer_ids:

                    model.Add(
                        x[
                            volunteer_id,
                            shift_id_a
                        ]
                        +
                        x[
                            volunteer_id,
                            shift_id_b
                        ]
                        <= 1
                    )

    # ========================================================
    # NUMBER OF SHIFTS PER VOLUNTEER
    # ========================================================

    shift_count = {}

    for volunteer_id in volunteer_ids:

        shift_count[volunteer_id] = model.NewIntVar(
            0,
            len(shift_ids),
            f"shift_count_{volunteer_id}",
        )

        model.Add(
            shift_count[volunteer_id]
            ==
            sum(
                x[volunteer_id, shift_id]
                for shift_id in shift_ids
            )
        )

    # ========================================================
    # PHASE 1
    # MAXIMIZE FILLED POSITIONS
    # ========================================================
    #
    # This is solved as its own objective, in isolation, so
    # filling a shift can never be traded away for a preference
    # or a desired-shift-count match later on.

    total_filled = sum(
        x[volunteer_id, shift_id]
        for volunteer_id in volunteer_ids
        for shift_id in shift_ids
    )

    model.Maximize(total_filled)

    solver = cp_model.CpSolver()

    # Gives OR-Tools multiple CPU threads.
    solver.parameters.num_search_workers = 8

    status = solver.Solve(model)

    if status not in {
        cp_model.OPTIMAL,
        cp_model.FEASIBLE,
    }:

        print()
        print("No feasible schedule found.")

        return

    max_filled = int(solver.Value(total_filled))

    print()
    print(f"Phase 1: {max_filled} positions can be filled.")

    # Lock that count in. Phase 2 can only decide WHO fills each
    # spot, never fill fewer spots to chase a preference.

    model.Add(
        total_filled == max_filled
    )

    # ========================================================
    # PHASE 2
    # AMONG SCHEDULES THAT FILL THE MAX, PREFER...
    # ========================================================

    objective_terms = []

    # --------------------------------------------------------
    # ROLE PREFERENCES
    # --------------------------------------------------------

    for volunteer_id in volunteer_ids:

        for shift_id in shift_ids:

            shift = shifts[shift_id]

            if volunteer_prefers_shift(
                volunteer_id,
                shift,
                role_preferences,
            ):

                objective_terms.append(
                    ROLE_PREFERENCE_WEIGHT
                    * x[volunteer_id, shift_id]
                )

    # --------------------------------------------------------
    # DESIRED NUMBER OF SHIFTS
    # --------------------------------------------------------

    deviations = {}

    for volunteer_id in volunteer_ids:

        volunteer = volunteers[
            volunteer_id
        ]

        target = get_target_shift_count(
            volunteer
        )

        # "Indifferent" volunteers don't need a target.
        if target is None:
            continue

        # Absolute difference:
        #
        # |actual shifts - desired shifts|
        #
        # Smaller = better.

        deviation = model.NewIntVar(
            0,
            len(shift_ids),
            f"deviation_{volunteer_id}",
        )

        model.AddAbsEquality(
            deviation,
            shift_count[volunteer_id] - target,
        )

        deviations[volunteer_id] = deviation

        # We maximize the objective, therefore deviation
        # receives a negative score.

        objective_terms.append(
            -DESIRED_SHIFT_WEIGHT
            * deviation
        )

    # --------------------------------------------------------
    # MAXIMIZE PREFERENCE SCORE
    # --------------------------------------------------------

    model.Maximize(
        sum(objective_terms)
    )

    # ========================================================
    # SOLVE
    # ========================================================

    status = solver.Solve(model)

    # ========================================================
    # CHECK RESULT
    # ========================================================

    if status not in {
        cp_model.OPTIMAL,
        cp_model.FEASIBLE,
    }:

        print()
        print("No feasible schedule found.")

        return

    print()
    print("Schedule found.")

    # ========================================================
    # COLLECT ASSIGNMENTS
    # ========================================================

    assignments = []

    for shift_id in shift_ids:

        shift = shifts[shift_id]

        for volunteer_id in volunteer_ids:

            if solver.Value(
                x[volunteer_id, shift_id]
            ) == 1:

                volunteer = volunteers[
                    volunteer_id
                ]

                preferred = (
                    volunteer_prefers_shift(
                        volunteer_id,
                        shift,
                        role_preferences,
                    )
                )

                assignments.append({
                    "id": len(assignments) + 1,
                    "volunteer_id": volunteer_id,
                    "first_name": volunteer[
                        "first_name"
                    ],
                    "last_name": volunteer[
                        "last_name"
                    ],
                    "shift_id": shift_id,
                    "date": shift["date"],
                    "start_time": (
                        shift["start_time"]
                        .strftime("%H:%M")
                    ),
                    "end_time": (
                        shift["end_time"]
                        .strftime("%H:%M")
                    ),
                    "venue": shift["venue"],
                    "location": shift["location"],
                    "role_category": shift[
                        "role_category"
                    ],
                    "preferred_role": preferred,
                    # Every assignment starts out awaiting the
                    # volunteer's confirmation via their personal
                    # link (see README's Email/Backup flows).
                    "status": "pending",
                })

    # ========================================================
    # WRITE OUTPUT CSV
    # ========================================================

    # volunteer_id/shift_id is all the `assignments` table needs —
    # everything else about a volunteer or shift is looked up via
    # a join, so writing it here would just be duplicated data.
    fieldnames = [
        "id",
        "volunteer_id",
        "shift_id",
        "status",
    ]

    with open(
        ASSIGNMENTS_FILE,
        "w",
        newline="",
        encoding="utf-8",
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames,
            extrasaction="ignore",
        )

        writer.writeheader()
        writer.writerows(assignments)

    # ========================================================
    # SUMMARY
    # ========================================================

    total_required = sum(
        shift["volunteers_needed"]
        for shift in shifts.values()
    )

    total_assigned = len(assignments)

    preferred_assignments = sum(
        assignment["preferred_role"]
        for assignment in assignments
    )

    print()
    print("RESULT")
    print("------")

    print(
        f"Required positions: {total_required}"
    )

    print(
        f"Assigned positions: {total_assigned}"
    )

    if total_required > 0:

        percentage = (
            total_assigned
            / total_required
            * 100
        )

        print(
            f"Positions filled: "
            f"{percentage:.1f}%"
        )

    if total_assigned > 0:

        preference_percentage = (
            preferred_assignments
            / total_assigned
            * 100
        )

        print(
            f"Preferred-role assignments: "
            f"{preference_percentage:.1f}%"
        )

    print()
    print(
        f"Assignments saved to:"
        f"\n{ASSIGNMENTS_FILE}"
    )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    optimize()