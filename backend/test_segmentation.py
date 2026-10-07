import pandas as pd

from app.ml.segmentation import (
    perform_customer_segmentation,
    generate_segment_summary,
    assign_segment_names,
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

    print(
        f"Unique customers: "
        f"{df['customer_id'].nunique()}"
    )

    print(
        "\nRunning customer segmentation..."
    )

    result = perform_customer_segmentation(
        df,
        n_clusters=4
    )

    print(
        "\nSilhouette Score"
    )

    print(
        "----------------"
    )

    print(
        round(
            result["silhouette_score"],
            4
        )
    )

    # Assign business names
    result = assign_segment_names(
        result
    )

    # Generate summary
    summary = generate_segment_summary(
        result
    )

    print(
        "\nCustomer Segment Summary"
    )

    print(
        "========================"
    )

    print(
        summary.to_string(
            index=False
        )
    )

    print(
        "\nCustomers by Segment"
    )

    print(
        "===================="
    )

    segment_counts = (
        result["rfm"]
        ["segment"]
        .value_counts()
    )

    for segment, count in (
        segment_counts.items()
    ):

        print(
            f"{segment}: {count}"
        )

    print(
        "\nSample Customers"
    )

    print(
        "================"
    )

    sample = (
        result["rfm"]
        [
            [
                "customer_id",
                "recency",
                "frequency",
                "monetary",
                "segment"
            ]
        ]
        .head(10)
    )

    print(
        sample.to_string(
            index=False
        )
    )


if __name__ == "__main__":
    main()