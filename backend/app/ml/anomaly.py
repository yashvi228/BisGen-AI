import pandas as pd
from sklearn.ensemble import IsolationForest


FEATURE_COLUMNS = [
    "sales",
    "quantity",
    "profit",
]


def prepare_anomaly_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare numerical features required for anomaly detection.
    """

    df = df.copy()

    # Convert required columns to numeric
    for column in FEATURE_COLUMNS:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    # Remove rows where required features are missing
    df = df.dropna(
        subset=FEATURE_COLUMNS
    ).reset_index(drop=True)

    return df


def detect_anomalies(
    df: pd.DataFrame,
    contamination: float = 0.01
):
    """
    Detect anomalous transactions using Isolation Forest.

    Parameters
    ----------
    df : pandas DataFrame
        Transaction-level business data.

    contamination : float
        Expected proportion of anomalies.

    Returns
    -------
    dict
        Anomaly detection results.
    """

    df = prepare_anomaly_data(df)

    if len(df) == 0:
        raise ValueError(
            "No valid data available for anomaly detection."
        )

    # Features used by the model
    X = df[FEATURE_COLUMNS]

    # Create Isolation Forest model
    model = IsolationForest(
        n_estimators=200,
        contamination=contamination,
        random_state=42,
        n_jobs=-1
    )

    # Train model
    model.fit(X)

    # Predict
    predictions = model.predict(X)

    # Convert:
    # -1 = anomaly
    #  1 = normal
    df["is_anomaly"] = (
        predictions == -1
    ).astype(int)

    # Anomaly score
    df["anomaly_score"] = (
        model.decision_function(X)
    )

    # Number of anomalies
    total_transactions = len(df)

    total_anomalies = int(
        df["is_anomaly"].sum()
    )

    anomaly_rate = (
        total_anomalies /
        total_transactions
    ) * 100

    # Get suspicious transactions
    anomalies = (
        df[df["is_anomaly"] == 1]
        .sort_values(
            "anomaly_score",
            ascending=True
        )
    )

    return {
        "model": model,
        "data": df,
        "total_transactions": total_transactions,
        "total_anomalies": total_anomalies,
        "anomaly_rate": round(
            float(anomaly_rate),
            2
        ),
        "anomalies": anomalies,
    }


def get_top_anomalies(
    df: pd.DataFrame,
    contamination: float = 0.01,
    limit: int = 20
):
    """
    Detect anomalies and return the top suspicious
    transactions in a JSON-friendly format.
    """

    result = detect_anomalies(
        df,
        contamination=contamination
    )

    anomalies = result["anomalies"].head(limit)

    output = []

    for _, row in anomalies.iterrows():

        output.append({
            "order_id": str(
                row.get("order_id", "")
            ),

            "product_name": str(
                row.get("product_name", "")
            ),

            "category": str(
                row.get("category", "")
            ),

            "sub_category": str(
                row.get("sub_category", "")
            ),

            "region": str(
                row.get("region", "")
            ),

            "customer_name": str(
                row.get("customer_name", "")
            ),

            "sales": round(
                float(row["sales"]),
                2
            ),

            "quantity": int(
                row["quantity"]
            ),

            "profit": round(
                float(row["profit"]),
                2
            ),

            "anomaly_score": round(
                float(row["anomaly_score"]),
                4
            ),

            "is_anomaly": True,
        })

    return {
        "total_transactions":
            result["total_transactions"],

        "total_anomalies":
            result["total_anomalies"],

        "anomaly_rate":
            result["anomaly_rate"],

        "anomalies":
            output,
    }