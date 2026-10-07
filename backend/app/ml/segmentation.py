import pandas as pd
import numpy as np

from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score


def prepare_rfm_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create customer-level RFM features.

    RFM:
    Recency  = Days since last purchase
    Frequency = Number of unique orders
    Monetary = Total sales
    """

    df = df.copy()

    # Make sure order_date is datetime
    df["order_date"] = pd.to_datetime(
        df["order_date"],
        errors="coerce"
    )

    # Remove rows without required values
    df = df.dropna(
        subset=[
            "customer_id",
            "order_id",
            "order_date",
            "sales"
        ]
    )

    # Reference date = day after the last transaction
    reference_date = (
        df["order_date"].max()
        + pd.Timedelta(days=1)
    )

    agg_kwargs = {
        "recency": (
            "order_date",
            lambda x: (
                reference_date - x.max()
            ).days
        ),
        "frequency": (
            "order_id",
            "nunique"
        ),
        "monetary": (
            "sales",
            "sum"
        ),
    }
    if "customer_name" in df.columns:
        agg_kwargs["customer_name"] = ("customer_name", "first")

    # Customer-level RFM
    rfm = (
        df.groupby("customer_id")
        .agg(**agg_kwargs)
        .reset_index()
    )

    return rfm


def perform_customer_segmentation(
    df: pd.DataFrame,
    n_clusters: int = 4
):
    """
    Perform customer segmentation using
    RFM + K-Means.
    """

    rfm = prepare_rfm_data(df)

    if len(rfm) < n_clusters:
        raise ValueError(
            "Number of customers is smaller "
            "than number of clusters."
        )

    features = [
        "recency",
        "frequency",
        "monetary"
    ]

    X = rfm[features].copy()

    # Log transformation reduces the effect
    # of extremely large values.
    X["recency"] = np.log1p(
        X["recency"]
    )

    X["frequency"] = np.log1p(
        X["frequency"]
    )

    X["monetary"] = np.log1p(
        X["monetary"]
    )

    # Standardize features
    scaler = StandardScaler()

    X_scaled = scaler.fit_transform(X)

    # K-Means
    model = KMeans(
        n_clusters=n_clusters,
        random_state=42,
        n_init=10
    )

    clusters = model.fit_predict(
        X_scaled
    )

    rfm["cluster"] = clusters

    # Silhouette score
    silhouette = silhouette_score(
        X_scaled,
        clusters
    )

    return {
        "model": model,
        "scaler": scaler,
        "rfm": rfm,
        "silhouette_score": float(
            silhouette
        )
    }


def generate_segment_summary(
    segmentation_result
):
    """
    Generate business-friendly statistics
    for each customer segment.
    """

    rfm = segmentation_result["rfm"]

    group_cols = ["cluster", "segment"] if "segment" in rfm.columns else ["cluster"]

    summary = (
        rfm.groupby(group_cols)
        .agg(
            customers=(
                "customer_id",
                "count"
            ),

            avg_recency=(
                "recency",
                "mean"
            ),

            avg_frequency=(
                "frequency",
                "mean"
            ),

            avg_monetary=(
                "monetary",
                "mean"
            ),

            total_revenue=(
                "monetary",
                "sum"
            )
        )
        .reset_index()
    )

    summary = summary.round(2)

    return summary
def assign_segment_names(
    segmentation_result
):
    """
    Assign business-friendly names to clusters
    based on their RFM characteristics.
    """

    rfm = segmentation_result["rfm"].copy()

    cluster_stats = (
        rfm.groupby("cluster")
        .agg(
            avg_recency=("recency", "mean"),
            avg_frequency=("frequency", "mean"),
            avg_monetary=("monetary", "mean")
        )
        .reset_index()
    )

    # Rank each metric
    cluster_stats["recency_rank"] = (
        cluster_stats["avg_recency"]
        .rank(
            ascending=True,
            method="min"
        )
    )

    cluster_stats["frequency_rank"] = (
        cluster_stats["avg_frequency"]
        .rank(
            ascending=False,
            method="min"
        )
    )

    cluster_stats["monetary_rank"] = (
        cluster_stats["avg_monetary"]
        .rank(
            ascending=False,
            method="min"
        )
    )

    segment_names = {}

    for _, row in cluster_stats.iterrows():

        cluster = int(row["cluster"])

        recency = row["avg_recency"]
        frequency = row["avg_frequency"]
        monetary = row["avg_monetary"]

        # High-value customers:
        # recent + frequent + high spending
        if (
            recency <= cluster_stats["avg_recency"].median()
            and
            frequency >= cluster_stats["avg_frequency"].median()
            and
            monetary >= cluster_stats["avg_monetary"].median()
        ):
            name = "High Value"

        # At-risk:
        # long time since purchase
        elif (
            recency >
            cluster_stats["avg_recency"].median()
            and
            frequency <=
            cluster_stats["avg_frequency"].median()
        ):
            name = "At Risk"

        # Loyal:
        # frequent purchases
        elif frequency >= cluster_stats["avg_frequency"].median():

            name = "Loyal"

        else:

            name = "Regular"

        segment_names[cluster] = name

    rfm["segment"] = rfm["cluster"].map(
        segment_names
    )

    segmentation_result["rfm"] = rfm

    return segmentation_result