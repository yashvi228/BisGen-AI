from fastapi import APIRouter, HTTPException
import pandas as pd

from app.ml.forecasting import forecast_future_sales


router = APIRouter(
    prefix="/api/ml",
    tags=["Machine Learning"]
)


DATASET_PATH = "../datasets/superstore_cleaned.csv"


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