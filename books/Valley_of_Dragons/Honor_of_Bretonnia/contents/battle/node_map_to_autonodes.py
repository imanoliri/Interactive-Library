import pandas as pd
import os


def generate_battle_nodes_from_node_map(battles_path: str, battle_name: str):
    battle_dir = f"{battles_path}/{battle_name}"
    node_map_excel_file = f"{battle_dir}/{battle_name}_node_map.xlsx"
    autonodes_excel_file = f"{battle_dir}/{battle_name}_autonodes.xlsx"

    df_node_map = pd.read_excel(node_map_excel_file, "node_map", index_col=0)
    df_nodes = nodes_from_node_map(df_node_map)
    df_nodes.to_excel(autonodes_excel_file, sheet_name="autonodes", index=False)


def nodes_from_node_map(dfm: pd.DataFrame) -> pd.DataFrame:
    nodes = []
    for idx in dfm.index:
        for c in dfm.columns:
            if pd.isnull(dfm.loc[idx, c]):
                continue
            nodes.append([dfm.loc[idx, c], c, idx])
    return pd.DataFrame(nodes, columns=["id", "x", "y"]).sort_values("id", ascending=True)


if __name__ == "__main__":
    battles_path = "contents/battle"
    battle_dirs = [f for f in os.listdir(battles_path) if os.path.isdir(os.path.join(battles_path, f))]
    for battle_dir in battle_dirs[::-1]:
        try:
            battle_name = os.path.basename(battle_dir)
            print(f"{battle_name}...")
            generate_battle_nodes_from_node_map(battles_path, battle_name)
            print(f"\t{battle_name}\n")
        except Exception as err:
            print(str(err))
