from fastapi import APIRouter

from app.services.analytics import AnalyticsService


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)

analytics_service = AnalyticsService()


@router.get("/summary")
def get_summary():

    return {
        "success": True,
        "data": analytics_service.get_summary()
    }


@router.get("/sales-by-region")
def sales_by_region():

    return {
        "success": True,
        "data": analytics_service.get_sales_by_region()
    }


@router.get("/profit-by-category")
def profit_by_category():

    return {
        "success": True,
        "data": analytics_service.get_profit_by_category()
    }


@router.get("/top-products")
def top_products(limit: int = 10):

    return {
        "success": True,
        "data": analytics_service.get_top_products(
            limit
        )
    }


@router.get("/sales-by-month")
def sales_by_month():

    return {
        "success": True,
        "data": analytics_service.get_sales_by_month()
    }


from pathlib import Path
import pandas as pd
from app.ml.anomaly import get_top_anomalies

def _find_dataset():
    candidates = [
        Path(__file__).resolve().parents[3] / "datasets" / "superstore_cleaned.csv",
        Path(__file__).resolve().parents[2] / "datasets" / "superstore_cleaned.csv",
        Path("datasets/superstore_cleaned.csv").resolve(),
        Path("../datasets/superstore_cleaned.csv").resolve(),
    ]
    for c in candidates:
        if c.exists():
            return c
    return candidates[0]

_DATASET_PATH = _find_dataset()


@router.get("/anomalies")
def get_anomalies_alias(contamination: float = 0.01, limit: int = 50):

    df = pd.read_csv(
        _DATASET_PATH,
        parse_dates=[
            "order_date",
            "ship_date"
        ]
    )

    return {
        "success": True,
        "data": get_top_anomalies(
            df,
            contamination=contamination,
            limit=limit
        )
    }


from app.ml.segmentation import (
    perform_customer_segmentation,
    generate_segment_summary,
    assign_segment_names,
)

@router.get("/segmentation")
def get_customer_segmentation_alias(clusters: int = 4):
    df = pd.read_csv(
        _DATASET_PATH,
        parse_dates=["order_date", "ship_date"]
    )
    result = perform_customer_segmentation(df, n_clusters=clusters)
    result = assign_segment_names(result)
    summary = generate_segment_summary(result)
    cols = ["customer_id", "recency", "frequency", "monetary", "cluster", "segment"]
    if "customer_name" in result["rfm"].columns:
        cols.insert(1, "customer_name")
    return {
        "success": True,
        "data": {
            "total_customers": len(result["rfm"]),
            "clusters": clusters,
            "silhouette_score": round(result["silhouette_score"], 4),
            "summary": summary.to_dict(orient="records"),
            "customers": result["rfm"][cols].to_dict(orient="records"),
        }
    }