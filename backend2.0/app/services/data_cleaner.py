import pandas as pd

def clean_data(filepath):

    df = pd.read_csv(filepath)

    # remove empty columns
    df = df.dropna(axis=1, how="all")

    # fill missing values
    df = df.fillna(0)

    # convert numbers
    for col in df.columns:
        try:
            df[col] = pd.to_numeric(df[col])
        except:
            pass

    return df
