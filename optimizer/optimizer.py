from pathlib import Path
import csv

from ortools.sat.python import cp_model

from load_data import (
    load_all_data,
    volunteer_available_for_shift,
    volunteer_prefers_shift,
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
# Higher weight = more important to the optimizer.
#
# Filling shifts is intentionally much more important than
# matching preferences.
#

FILL_SHIFT_WEIGHT = 100
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
    # OBJECTIVE
    # ========================================================

    objective_terms = []

    # --------------------------------------------------------
    # OBJECTIVE 1
    # FILL AS MANY POSITIONS AS POSSIBLE
    # --------------------------------------------------------

    for volunteer_id in volunteer_ids:
        for shift_id in shift_ids:

            objective_terms.append(
                FILL_SHIFT_WEIGHT
                * x[volunteer_id, shift_id]
            )

    # --------------------------------------------------------
    # OBJECTIVE 2
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
    # OBJECTIVE 3
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
    # MAXIMIZE TOTAL SCORE
    # --------------------------------------------------------

    model.Maximize(
        sum(objective_terms)
    )

    # ========================================================
    # SOLVE
    # ========================================================

    solver = cp_model.CpSolver()

    # Gives OR-Tools multiple CPU threads.
    solver.parameters.num_search_workers = 8

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
                })

    # ========================================================
    # WRITE OUTPUT CSV
    # ========================================================

    fieldnames = [
        "volunteer_id",
        "first_name",
        "last_name",
        "shift_id",
        "date",
        "start_time",
        "end_time",
        "venue",
        "location",
        "role_category",
        "preferred_role",
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