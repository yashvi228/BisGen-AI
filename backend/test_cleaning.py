import pandas as pd

from app.data.cleaning import clean_dataset


file_path = "../datasets/SuperStore Sales DataSet.xlsx"

df = pd.read_excel(file_path)

print("\nBEFORE CLEANING")
print(df.columns.tolist())

cleaned_df = clean_dataset(df)

print("\nAFTER CLEANING")
print(cleaned_df.columns.tolist())

print("\nDATA TYPES")
print(cleaned_df.dtypes)

print("\nSHAPE")
print(cleaned_df.shape)

print("\nMISSING VALUES")
print(cleaned_df.isnull().sum())

print("\nFIRST 5 ROWS")
print(cleaned_df.head())