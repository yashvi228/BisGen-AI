import pandas as pd

from app.services.analytics_db import AnalyticsDatabase


FILE = "../datasets/superstore_cleaned.csv"


def main():

    print("Loading cleaned dataset...")

    df = pd.read_csv(
        FILE,
        parse_dates=[
            "order_date",
            "ship_date"
        ]
    )

    print(f"Rows: {len(df)}")
    print(f"Columns: {len(df.columns)}")

    db = AnalyticsDatabase()

    db.load_dataframe(
        df,
        "sales"
    )

    print("\nDataset loaded into DuckDB.")

    result = db.query(
        """
        SELECT COUNT(*) AS total_rows
        FROM sales
        """
    )

    print("\nDatabase test:")
    print(result)

    db.close()


if __name__ == "__main__":
    main()