import pandas as pd
from pathlib import Path


def load_dataset(file_path: str) -> pd.DataFrame:
    """
    Load CSV or Excel dataset.
    """

    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Dataset not found: {file_path}"
        )

    extension = path.suffix.lower()

    if extension == ".csv":
        df = pd.read_csv(path)

    elif extension in [".xlsx", ".xls"]:
        df = pd.read_excel(path)

    else:
        raise ValueError(
            "Unsupported file format. "
            "Use CSV or Excel."
        )

    return df