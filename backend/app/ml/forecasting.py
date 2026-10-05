import pandas as pd
import numpy as np

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error


def prepare_monthly_sales(df: pd.DataFrame) -> pd.DataFrame:

    df = df.copy()

    df["order_date"] = pd.to_datetime(
        df["order_date"],
        errors="coerce"
    )

    monthly_sales = (
        df.groupby(
            df["order_date"].dt.to_period("M")
        )["sales"]
        .sum()
        .reset_index()
    )

    monthly_sales["order_date"] = (
        monthly_sales["order_date"]
        .dt.to_timestamp()
    )

    monthly_sales = monthly_sales.sort_values(
        "order_date"
    ).reset_index(drop=True)

    # Time features
    monthly_sales["time_index"] = np.arange(
        len(monthly_sales)
    )

    monthly_sales["month"] = (
        monthly_sales["order_date"].dt.month
    )

    monthly_sales["quarter"] = (
        monthly_sales["order_date"].dt.quarter
    )

    monthly_sales["year"] = (
        monthly_sales["order_date"].dt.year
    )

    return monthly_sales


def train_forecasting_models(df: pd.DataFrame):

    monthly_sales = prepare_monthly_sales(df)

    features = [
        "time_index",
        "month",
        "quarter",
        "year"
    ]

    X = monthly_sales[features]
    y = monthly_sales["sales"]

    # Last 6 months for testing
    test_size = 6

    X_train = X.iloc[:-test_size]
    X_test = X.iloc[-test_size:]

    y_train = y.iloc[:-test_size]
    y_test = y.iloc[-test_size:]

    models = {
        "linear_regression": LinearRegression(),

        "random_forest": RandomForestRegressor(
            n_estimators=200,
            random_state=42
        )
    }

    results = {}

    for name, model in models.items():

        model.fit(X_train, y_train)

        predictions = model.predict(X_test)

        mae = mean_absolute_error(
            y_test,
            predictions
        )

        rmse = np.sqrt(
            mean_squared_error(
                y_test,
                predictions
            )
        )

        results[name] = {
            "model": model,
            "mae": float(mae),
            "rmse": float(rmse)
        }

    return {
        "monthly_sales": monthly_sales,
        "results": results
    }


def forecast_future_sales(
    df: pd.DataFrame,
    months: int = 6
):

    result = train_forecasting_models(df)

    monthly_sales = result["monthly_sales"]
    results = result["results"]

    # Select model with lowest MAE
    best_model_name = min(
        results,
        key=lambda name: results[name]["mae"]
    )

    best_model = results[
        best_model_name
    ]["model"]

    last_index = (
        monthly_sales["time_index"].iloc[-1]
    )

    last_date = (
        monthly_sales["order_date"].iloc[-1]
    )

    future_dates = pd.date_range(
        start=last_date + pd.DateOffset(months=1),
        periods=months,
        freq="MS"
    )

    future_df = pd.DataFrame({
        "order_date": future_dates
    })

    future_df["time_index"] = np.arange(
        last_index + 1,
        last_index + months + 1
    )

    future_df["month"] = (
        future_df["order_date"].dt.month
    )

    future_df["quarter"] = (
        future_df["order_date"].dt.quarter
    )

    future_df["year"] = (
        future_df["order_date"].dt.year
    )

    features = [
        "time_index",
        "month",
        "quarter",
        "year"
    ]

    predictions = best_model.predict(
        future_df[features]
    )

    forecast = []

    for date, prediction in zip(
        future_dates,
        predictions
    ):

        forecast.append({
            "month": date.strftime("%Y-%m"),
            "predicted_sales": round(
                float(prediction),
                2
            )
        })

    evaluation = {}

    for name, model_result in results.items():

        evaluation[name] = {
            "mae": round(
                model_result["mae"],
                2
            ),
            "rmse": round(
                model_result["rmse"],
                2
            )
        }

    return {
        "best_model": best_model_name,
        "forecast": forecast,
        "evaluation": evaluation
    }