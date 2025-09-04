import pandas as pd
import math
import json
from typing import List
import os


MELEE_DISTANCE = 3.5
MELEE_HEIGHT_DIFFERENCE_THRESHOLD = 2.0
ARCHER_DISTANCE = 4.5
ARCHER_DISTANCE_GAIN_PER_HEIGHT = 0.5
SIEGE_DISTANCE = 11.0
SIEGE_DISTANCE_GAIN_PER_HEIGHT = 0.5
FLIER_DISTANCE = 10.0
FLIER_DISTANCE_GAIN_PER_HEIGHT = 0.5


def main():
    battle_name = os.path.basename(os.path.dirname(os.path.realpath(__file__)))
    battle_dir = f"contents/{battle_name}"
    excel_file = f"{battle_dir}/{battle_name}.xlsx"
    auto_data_dir = f"{battle_dir}/auto_data"

    os.makedirs(auto_data_dir, exist_ok=True)

    df_nodes = pd.read_excel(excel_file, "nodes").astype(dict(zip(["x", "y", "z"], [float, float, float])))
    df_interactions = pd.read_excel(excel_file, "interactions")
    df_units = pd.read_excel(excel_file, "units")
    df_parameters = pd.read_excel(excel_file, "parameters", index_col=0)

    write_parameters(df_parameters)

    with open(f"{auto_data_dir}/nodes.json", "w") as fp:
        json.dump(nodes_to_json(df_nodes), fp)

    with open(f"{auto_data_dir}/units.json", "w") as fp:
        json.dump(units_to_json(df_units), fp)

    networks = dict.fromkeys(validation_functions.keys())
    for network in networks:

        dfn = pd.DataFrame()
        if not df_interactions.empty:
            dfn = df_interactions.loc[~df_interactions.loc[:, network].isna()]

        network_interactions = interactions_from_nodes_and_interactions(df_nodes, dfn, network)

        if network == "archer" or network == "siege":
            # Remove archer/siege interactions if there is an equivalent melee one to avoid redundancy
            melee_network = networks["melee"]
            network_interactions = [i for i in network_interactions if i not in melee_network]

        networks[network] = network_interactions
        with open(f"{auto_data_dir}/{network}_interactions.json", "w") as fp:
            json.dump(network_interactions, fp)


def write_parameters(df_parameters: pd.DataFrame):
    parameters_names = [
        "melee_distance",
        "melee_height_difference_threshold",
        "archer_distance",
        "archer_distance_height_gain",
        "siege_distance",
        "siege_distance_height_gain",
        "flier_distance",
        "flier_distance_height_gain",
    ]
    parameters = [
        "MELEE_DISTANCE",
        "MELEE_HEIGHT_DIFFERENCE_THRESHOLD",
        "ARCHER_DISTANCE",
        "ARCHER_DISTANCE_GAIN_PER_HEIGHT",
        "SIEGE_DISTANCE",
        "SIEGE_DISTANCE_GAIN_PER_HEIGHT",
        "FLIER_DISTANCE",
        "FLIER_DISTANCE_GAIN_PER_HEIGHT",
    ]

    for param_name, param in zip(parameters_names, parameters):
        param_value = df_parameters.loc[param_name].iloc[0]
        if pd.isnull(param_value):
            continue
        globals()[param] = param_value


def nodes_to_json(df_nodes) -> List[dict]:
    return df_to_json(df_nodes, 3)


def units_to_json(df_units) -> List[dict]:
    return df_to_json(df_units)


def df_to_json(df, nr_cols=None) -> List[dict]:
    cols = df.columns
    if nr_cols is not None:
        cols = df.columns[:nr_cols]
    return [dict(zip(cols, [None if pd.isnull(v) else v for v in vals])) for vals in df.loc[:, cols].values]


def interactions_from_nodes_and_interactions(df_nodes, df_interactions, network) -> pd.DataFrame:
    interactions = []
    for id1 in df_nodes.id:
        for id2 in df_nodes.id:
            if id1 == id2:
                continue

            node_1 = df_nodes.loc[df_nodes.id == id1].iloc[0]
            node_2 = df_nodes.loc[df_nodes.id == id2].iloc[0]

            if nodes_valid_interaction(node_1, node_2, df_interactions, network):
                interactions.append([id1, id2])

    return interactions


def nodes_valid_interaction(node_1, node_2, df_interactions, network) -> bool:
    # Normalize `network` into a list
    networks = [network] if isinstance(network, str) else network

    # If there are no manual interactions, use the network's default validation function
    if df_interactions.empty:
        return any(validation_functions[n](node_1, node_2) for n in networks)

    # Pre-compute default validity once
    validity_default = any(validation_functions[n](node_1, node_2) for n in networks)

    # Extract interaction data upfront to reduce overhead during iteration
    from_sets = df_interactions["from"].str.replace(" ", "").str.split(",").map(set).tolist()
    to_sets = df_interactions["to"].str.replace(" ", "").str.split(",").map(set).tolist()
    valid_flags_list = df_interactions[networks].to_numpy()

    # Evaluate validity
    validity = None
    for from_set, to_set, valid_flags in zip(from_sets, to_sets, valid_flags_list):
        # Skip rows where the nodes are not in the interaction
        if not (node_in_interaction(node_1, from_set) and node_in_interaction(node_2, to_set)):
            continue

        # Process validity flags
        min_flag = valid_flags.min()
        max_flag = valid_flags.max()

        # Apply force rules
        if min_flag == -2:  # Force false
            return False
        if max_flag == 2:  # Force true
            return True

        # Update validity based on rules
        if min_flag == -1:
            validity = False
        elif max_flag == 1:
            validity = True
        elif min_flag == 0 and max_flag == 0:
            validity = validity_default

    # Return final validity
    return validity if validity is not None else validity_default


def nodes_in_interaction(node_1, node_2, interaction) -> bool:
    # Pre-process interaction strings into sets for faster lookup
    from_set = set(interaction["from"].replace(" ", "").split(","))
    to_set = set(interaction["to"].replace(" ", "").split(","))

    # Check interactions for both nodes
    return node_in_interaction(node_1, from_set) and node_in_interaction(node_2, to_set)


def node_in_interaction(node, inter_set) -> bool:
    # Check if the node ID is in the interaction set
    if node.id in inter_set:
        return True

    # Retrieve group columns and check for intersection with the interaction set
    group_columns = (g for g in node.index if g.startswith("group_"))
    for group in group_columns:
        value = node[group]
        if pd.notnull(value) and (value in inter_set or "all" in inter_set):
            return True
    return False


def valid_melee_interaction(node_1, node_2) -> bool:
    if abs(node_1.z - node_2.z) > MELEE_HEIGHT_DIFFERENCE_THRESHOLD:
        return False
    return distance(node_1, node_2) < MELEE_DISTANCE


def valid_archer_interaction(node_1, node_2) -> bool:
    return distance(node_1, node_2) < ARCHER_DISTANCE * (
        1 + ARCHER_DISTANCE_GAIN_PER_HEIGHT * max([0, (node_1.z - node_2.z)])
    )


def valid_siege_interaction(node_1, node_2) -> bool:
    return distance(node_1, node_2) < SIEGE_DISTANCE * (
        1 + SIEGE_DISTANCE_GAIN_PER_HEIGHT * max([0, (node_1.z - node_2.z)])
    )


def valid_flier_interaction(node_1, node_2) -> bool:
    return distance_3d(node_1, node_2) < FLIER_DISTANCE * (
        1 + FLIER_DISTANCE_GAIN_PER_HEIGHT * max([0, (node_1.z - node_2.z)])
    )


def distance(node_1, node_2) -> float:
    return euclidean_distance(node_1.x, node_1.y, node_2.x, node_2.y)


def distance_3d(node_1, node_2) -> float:
    return euclidean_distance_3d(node_1.x, node_1.y, node_1.z, node_2.x, node_2.y, node_2.z)


def euclidean_distance(x1, y1, x2, y2) -> float:
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)


def euclidean_distance_3d(x1, y1, z1, x2, y2, z2) -> float:
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2)


validation_functions = {
    "melee": valid_melee_interaction,
    "archer": valid_archer_interaction,
    "siege": valid_siege_interaction,
    "flier": valid_flier_interaction,
}


if __name__ == "__main__":
    main()
