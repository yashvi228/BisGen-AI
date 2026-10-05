import pandas as pd

from app.data.cleaning import clean_dataset


SOURCE_FILE = "../datasets/SuperStore Sales DataSet.xlsx"

OUTPUT_FILE = "../datasets/superstore_cleaned.csv"


def main():

    print("Loading dataset...")

    df = pd.read_excel(SOURCE_FILE)

    print(f"Original rows: {len(df)}")

    print("Cleaning dataset...")

    cleaned_df = clean_dataset(df)

    print(f"Cleaned rows: {len(cleaned_df)}")

    cleaned_df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print("\nCleaned dataset saved:")
    print(OUTPUT_FILE)

    print("\nColumns:")

    for column in cleaned_df.columns:
        print(f"- {column}")


if __name__ == "__main__":
    main()