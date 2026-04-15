def ask_dataset_question(df, question):

    if "average" in question:
        return df.mean(numeric_only=True)

    if "max" in question:
        return df.max(numeric_only=True)

    return "I cannot answer that yet"
