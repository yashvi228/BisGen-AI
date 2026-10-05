import pandas as pd

from app.services.analytics_db import AnalyticsDatabase


df = pd.read_csv(
    "../datasets/superstore_cleaned.csv",
    parse_dates=[
        "order_date",
        "ship_date"
    ]
)

db = AnalyticsDatabase()

db.load_dataframe(
    df,
    "sales"
)


queries = {

    "total_sales": """
        SELECT
            SUM(sales) AS total_sales
        FROM sales
    """,

    "total_profit": """
        SELECT
            SUM(profit) AS total_profit
        FROM sales
    """,

    "sales_by_region": """
        SELECT
            region,
            SUM(sales) AS total_sales
        FROM sales
        GROUP BY region
        ORDER BY total_sales DESC
    """,

    "profit_by_category": """
        SELECT
            category,
            SUM(profit) AS total_profit
        FROM sales
        GROUP BY category
        ORDER BY total_profit DESC
    """,

    "top_products": """
        SELECT
            product_name,
            SUM(sales) AS total_sales
        FROM sales
        GROUP BY product_name
        ORDER BY total_sales DESC
        LIMIT 10
    """
}


for name, sql in queries.items():

    print("\n==============================")
    print(name.upper())
    print("==============================")

    result = db.query(sql)

    print(result)


db.close()