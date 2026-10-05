import pandas as pd
import re


COLUMN_RENAME_MAP = {
    "Row ID+O6G3A1:R6": "row_id",
    "Order ID": "order_id",
    "Order Date": "order_date",
    "Ship Date": "ship_date",
    "Ship Mode": "ship_mode",
    "Customer ID": "customer_id",
    "Customer Name": "customer_name",
    "Segment": "segment",
    "Country": "country",
    "City": "city",
    "State": "state",
    "Region": "region",
    "Product ID": "product_id",
    "Category": "category",
    "Sub-Category": "sub_category",
    "Product Name": "product_name",
    "Sales": "sales",
    "Quantity": "quantity",
    "Profit": "profit",
    "Returns": "returns",
    "Payment Mode": "payment_mode",
}


def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:

    df = df.copy()

    # Rename known columns
    df = df.rename(columns=COLUMN_RENAME_MAP)

    # Clean any remaining column names
    df.columns = [
        re.sub(
            r"_+",
            "_",
            re.sub(
                r"[^a-zA-Z0-9]+",
                "_",
                column
            ).strip("_").lower()
        )
        for column in df.columns
    ]

    # Convert dates
    if "order_date" in df.columns:
        df["order_date"] = pd.to_datetime(
            df["order_date"],
            errors="coerce"
        )

    if "ship_date" in df.columns:
        df["ship_date"] = pd.to_datetime(
            df["ship_date"],
            errors="coerce"
        )

    # Numeric columns
    numeric_columns = [
        "row_id",
        "sales",
        "quantity",
        "profit",
        "returns"
    ]

    for column in numeric_columns:

        if column in df.columns:
            df[column] = pd.to_numeric(
                df[column],
                errors="coerce"
            )

    # Remove completely empty rows
    df = df.dropna(how="all")

    # Remove exact duplicates
    df = df.drop_duplicates()

    # Reset index
    df = df.reset_index(drop=True)

    return df