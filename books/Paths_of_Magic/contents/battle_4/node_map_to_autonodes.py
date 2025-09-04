import pandas as pd


def main():
    battle_name = "battle_4"
    battle_dir = f"contents/{battle_name}"
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
    main()
