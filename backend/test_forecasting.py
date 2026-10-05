import pandas as pd

from app.ml.forecasting import forecast_future_sales


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

    print(f"Rows loaded: {len(df)}")

    print("\nTraining forecasting models...")

    result = forecast_future_sales(
        df,
        months=6
    )

    print("\nModel Evaluation")
    print("----------------")

    for model, metrics in result["evaluation"].items():

        print(f"\n{model}")

        print(
            f"MAE: {metrics['mae']:.2f}"
        )

        print(
            f"RMSE: {metrics['rmse']:.2f}"
        )

    print("\nBest Model")
    print("----------")

    print(result["best_model"])

    print("\nFuture Sales Forecast")
    print("---------------------")

    for item in result["forecast"]:

        print(
            f"{item['month']} → "
            f"${item['predicted_sales']:,.2f}"
        )


if __name__ == "__main__":
    main()