import pandas as pd
import os
from functools import reduce

# --- Configuration ---
base_path = os.path.dirname(__file__)
english_file = os.path.join(base_path, 'english.txt')
serbian_file = os.path.join(base_path, 'serbian.csv')
russian_file = os.path.join(base_path, 'russian.csv')
output_file = os.path.join(base_path, 'mkb_data.csv')

# --- Helper Functions ---
def standardize_code(code):
    """
    Standardizes MKB-10 codes to a consistent format (e.g., A00.0).
    Handles codes with or without a dot, and removes extra characters.
    """
    if pd.isna(code):
        return None
    code = str(code).strip().upper().replace(' ', '').replace('.-', '')
    if len(code) == 4 and '.' not in code:
        return f"{code[:3]}.{code[3:]}"
    return code

# --- Data Processing ---
dataframes = []
print("--- Starting Data Processing (v4) ---")

# 1. Process English TXT file
try:
    df_en = pd.read_csv(
        english_file,
        sep=';',
        header=None,
        usecols=[6, 8], # Use 7th and 9th columns
        names=['code', 'diagnosis_en'],
        dtype=str,
        encoding='utf-8-sig'
    )
    df_en['code'] = df_en['code'].apply(standardize_code)
    dataframes.append(df_en)
    print(f"[SUCCESS] Processed English file. Found {len(df_en)} records.")
except Exception as e:
    print(f"[ERROR] Could not process English file: {e}")

# 2. Process Serbian CSV file
try:
    df_sr_lat = pd.read_csv(
        serbian_file,
        usecols=['code', 'diagnosis_sr', 'diagnosis_lat'],
        header=0,
        dtype=str,
        encoding='utf-8-sig'
    )
    df_sr_lat['code'] = df_sr_lat['code'].apply(standardize_code)
    df_sr_lat.rename(columns={'diagnosis_sr': 'diagnosis_sr_latn'}, inplace=True)
    dataframes.append(df_sr_lat)
    print(f"[SUCCESS] Processed Serbian/Latin file. Found {len(df_sr_lat)} records.")
except Exception as e:
    print(f"[ERROR] Could not process Serbian file: {e}")

# 3. Process Russian CSV file
try:
    df_ru = pd.read_csv(
        russian_file,
        header=None,
        usecols=[2, 3], # Use 3rd and 4th columns
        names=['code', 'diagnosis_ru'],
        dtype=str,
        encoding='utf-8-sig'
    )
    df_ru['code'] = df_ru['code'].apply(standardize_code)
    dataframes.append(df_ru)
    print(f"[SUCCESS] Processed Russian file. Found {len(df_ru)} records.")
except Exception as e:
    print(f"[ERROR] Could not process Russian file: {e}")

# --- Merging and Cleaning ---
if len(dataframes) < 3:
    print("\n--- Merge Aborted: Not all data files were loaded successfully. ---")
else:
    print("\n--- Merging DataFrames ---")
    # Merge all dataframes at once
    merged_df = reduce(lambda left, right: pd.merge(left, right, on='code', how='outer'), dataframes)

    # --- Final Cleanup ---
    # Drop rows that don't have a valid code after processing
    merged_df.dropna(subset=['code'], inplace=True)
    # Filter for valid MKB-10 format (e.g., A00, A00.0, A00.00)
    merged_df = merged_df[merged_df['code'].str.match(r'^[A-Z]\d{2}(\.\d{1,2})?$', na=False)]
    
    # Reorder columns and fill any remaining empty cells
    final_columns = ['code', 'diagnosis_en', 'diagnosis_sr_latn', 'diagnosis_ru', 'diagnosis_lat']
    merged_df = merged_df.reindex(columns=final_columns)
    merged_df.fillna('', inplace=True)

    # Sort and remove duplicates
    merged_df.sort_values('code', inplace=True)
    merged_df.drop_duplicates(subset=['code'], keep='first', inplace=True)
    merged_df.reset_index(drop=True, inplace=True)

    # --- Export to CSV ---
    try:
        merged_df.to_csv(output_file, index=False, encoding='utf-8')
        print(f"\n[SUCCESS] Created merged file at: {output_file}")
        print(f"Total unique codes processed: {len(merged_df)}")
        print("\n--- Final Sample (first 5 rows) ---")
        print(merged_df.head(5).to_string())
    except Exception as e:
        print(f"\n[ERROR] Could not write to output file: {e}")