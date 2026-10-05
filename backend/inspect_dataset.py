import pandas as pd
from pathlib import Path

DATASET_DIR = Path("../datasets")

files = list(DATASET_DIR.glob("*"))

print("\n========== DATASET FILES ==========\n")

for file in files:
    print(file.name)

if not files:
    raise FileNotFoundError("No dataset found in datasets/")

file_path = files[0]

print("\nUsing:", file_path)

# Load dataset
if file_path.suffix.lower() == ".csv":
    df = pd.read_csv(file_path)

elif file_path.suffix.lower() in [".xlsx", ".xls"]:
    df = pd.read_excel(file_path)

else:
    raise ValueError(
        f"Unsupported file type: {file_path.suffix}"
    )

print("\n========== BASIC INFORMATION ==========\n")

print("Rows:", df.shape[0])
print("Columns:", df.shape[1])

print("\n========== COLUMN NAMES ==========\n")

for i, column in enumerate(df.columns, 1):
    print(f"{i}. {column}")

print("\n========== DATA TYPES ==========\n")

print(df.dtypes)

print("\n========== MISSING VALUES ==========\n")

print(df.isnull().sum())

print("\n========== DUPLICATES ==========\n")

print("Duplicate rows:", df.duplicated().sum())

print("\n========== FIRST 5 ROWS ==========\n")

print(df.head())

print("\n========== NUMERICAL SUMMARY ==========\n")

print(df.describe())