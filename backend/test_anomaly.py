import pandas as pd

from app.ml.anomaly import (
    detect_anomalies,
    get_top_anomalies,
)


DATASET = "../datasets/superstore_cleaned.csv"


def main():

    print("Loading dataset...")

    df = pd.read_csv(
        DATASET,
        parse_dates=[
            "order_date",
            "ship_date"
        ]
    )

    print(
        f"Rows loaded: {len(df)}"
    )

    print("\nRunning anomaly detection...")

    result = detect_anomalies(
        df,
        contamination=0.01
    )

    print("\nAnomaly Detection Results")
    print("==========================")

    print(
        f"Total transactions: "
        f"{result['total_transactions']}"
    )

    print(
        f"Total anomalies: "
        f"{result['total_anomalies']}"
    )

    print(
        f"Anomaly rate: "
        f"{result['anomaly_rate']}%"
    )

    print("\nTop Anomalies")
    print("=============")

    top_anomalies = get_top_anomalies(
        df,
        contamination=0.01,
        limit=20
    )

    for index, anomaly in enumerate(
        top_anomalies["anomalies"],
        start=1
    ):

        print(
            f"\n{index}. "
            f"{anomaly['product_name']}"
        )

        print(
            f"   Order ID: "
            f"{anomaly['order_id']}"
        )

        print(
            f"   Sales: "
            f"${anomaly['sales']:,.2f}"
        )

        print(
            f"   Quantity: "
            f"{anomaly['quantity']}"
        )

        print(
            f"   Profit: "
            f"${anomaly['profit']:,.2f}"
        )

        print(
            f"   Anomaly Score: "
            f"{anomaly['anomaly_score']}"
        )


if __name__ == "__main__":
    main()