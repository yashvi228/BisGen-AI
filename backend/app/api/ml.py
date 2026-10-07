from pathlib import Path
from fastapi import APIRouter, HTTPException
import pandas as pd

from app.ml.forecasting import forecast_future_sales
from app.ml.anomaly import get_top_anomalies
from app.ml.segmentation import (
    perform_customer_segmentation,
    generate_segment_summary,
    assign_segment_names,
)

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

DATASET_PATH = _find_dataset()

router = APIRouter(
    prefix="/api/ml",
    tags=["Machine Learning"]
)

@router.get("/segmentation")
def get_customer_segmentation(
    clusters: int = 4
):
    if clusters < 2 or clusters > 8:
        raise HTTPException(
            status_code=400,
            detail="Clusters must be between 2 and 8."
        )

    try:

        df = pd.read_csv(
            DATASET_PATH,
            parse_dates=[
                "order_date",
                "ship_date"
            ]
        )

        result = perform_customer_segmentation(
            df,
            n_clusters=clusters
        )

        result = assign_segment_names(
            result
        )

        summary = generate_segment_summary(
            result
        )

        # Convert summary DataFrame
        summary_records = (
            summary.to_dict(
                orient="records"
            )
        )

        # Customer-level data
        cols = [
            "customer_id",
            "recency",
            "frequency",
            "monetary",
            "cluster",
            "segment",
        ]
        if "customer_name" in result["rfm"].columns:
            cols.insert(1, "customer_name")

        customer_data = (
            result["rfm"][cols]
            .to_dict(orient="records")
        )

        return {
            "success": True,
            "data": {
                "total_customers": len(
                    result["rfm"]
                ),

                "clusters": clusters,

                "silhouette_score": round(
                    result["silhouette_score"],
                    4
                ),

                "summary": summary_records,

                "customers": customer_data
            }
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/forecast")
def get_sales_forecast(months: int = 6):

    if months < 1 or months > 24:
        raise HTTPException(
            status_code=400,
            detail="Months must be between 1 and 24."
        )

    try:

        df = pd.read_csv(
            DATASET_PATH,
            parse_dates=[
                "order_date",
                "ship_date"
            ]
        )

        result = forecast_future_sales(
            df,
            months=months
        )

        return {
            "success": True,
            "data": result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/anomalies")
def get_anomalies(contamination: float = 0.01, limit: int = 50):

    if contamination <= 0 or contamination >= 0.5:
        raise HTTPException(
            status_code=400,
            detail="Contamination must be between 0 and 0.5."
        )

    if limit < 1 or limit > 500:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 500."
        )

    try:

        df = pd.read_csv(
            DATASET_PATH,
            parse_dates=[
                "order_date",
                "ship_date"
            ]
        )

        result = get_top_anomalies(
            df,
            contamination=contamination,
            limit=limit
        )

        return {
            "success": True,
            "data": result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )