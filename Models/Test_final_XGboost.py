import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
import xgboost as xgb
from sklearn.metrics import mean_squared_error, r2_score

# Load dataset
csv_file = r"E:\Me\coding\6th sem\Mini Project\Linear-regression\Main-Project\merged_output.csv"
data = pd.read_csv(csv_file)
print("Total no of data before computing", data.shape)

# Select relevant columns
data_new = data[["datetime", "tempmax", "tempmin"]].copy()
data_new["datetime"] = pd.to_datetime(data_new["datetime"], errors="coerce", dayfirst=True)

# Drop invalid and duplicate entries
data_new.dropna(subset=["datetime"], inplace=True)
data_new.drop_duplicates(inplace=True)

# Fill missing values with median values
data_new["tempmax"] = data_new["tempmax"].fillna(data_new["tempmax"].median())
data_new["tempmin"] = data_new["tempmin"].fillna(data_new["tempmin"].median())


# Rename columns
data_new.columns = ["datetime", "temp_max", "temp_min"]

# Feature engineering
data_new["Day_of_week"] = data_new["datetime"].dt.dayofweek
data_new["Quarter"] = data_new["datetime"].dt.quarter
data_new["Month"] = data_new["datetime"].dt.month
data_new["Year"] = data_new["datetime"].dt.year
data_new["Day_of_Year"] = data_new["datetime"].dt.dayofyear
data_new["Day_of_month"] = data_new["datetime"].dt.day
data_new["Week_of_Year"] = data_new["datetime"].dt.isocalendar().week.astype(int)

df_final = data_new.copy()

# Define input (X) and target (Y) variables
X = df_final[['Day_of_week', 'Quarter', 'Month', 'Year', 'Day_of_Year', 'Day_of_month', 'Week_of_Year']]
Y_max = df_final['temp_max']
Y_min = df_final['temp_min']

# Split data into training, validation, and test sets
X_train, X_test, Y_train_max, Y_test_max, Y_train_min, Y_test_min = train_test_split(
    X, Y_max, Y_min, test_size=0.3, random_state=42
)

# Train XGBoost model for max and min temperatures
XGB_max = xgb.XGBRegressor(n_estimators=50, learning_rate=0.1, random_state=42)
XGB_max.fit(X_train, Y_train_max)

XGB_min = xgb.XGBRegressor(n_estimators=50, learning_rate=0.1, random_state=42)
XGB_min.fit(X_train, Y_train_min)

# Make predictions
Y_pred_test_max = XGB_max.predict(X_test)
Y_pred_train_max = XGB_max.predict(X_train)
Y_pred_test_min = XGB_min.predict(X_test)
Y_pred_train_min = XGB_min.predict(X_train)

# Calculate model performance metrics
mse_test_max = mean_squared_error(Y_test_max, Y_pred_test_max)
r2_test_max = r2_score(Y_test_max, Y_pred_test_max)

mse_train_max = mean_squared_error(Y_train_max, Y_pred_train_max)
r2_train_max = r2_score(Y_train_max, Y_pred_train_max)

mse_test_min = mean_squared_error(Y_test_min, Y_pred_test_min)
r2_test_min = r2_score(Y_test_min, Y_pred_test_min)

mse_train_min = mean_squared_error(Y_train_min, Y_pred_train_min)
r2_train_min = r2_score(Y_train_min, Y_pred_train_min)

print("\n--- Max Temperature Metrics ---")
print(f"Test MSE: {mse_test_max:.4f}, R2: {r2_test_max:.4f}")
print(f"Train MSE: {mse_train_max:.4f}, R2: {r2_train_max:.4f}")

print("\n--- Min Temperature Metrics ---")
print(f"Test MSE: {mse_test_min:.4f}, R2: {r2_test_min:.4f}")
print(f"Train MSE: {mse_train_min:.4f}, R2: {r2_train_min:.4f}")

# Scatter Plot: Actual vs Predicted Max and Min Temperatures
plt.figure(figsize=(12, 5))

# Scatter plot for max temperature
plt.subplot(1, 2, 1)
plt.scatter(Y_test_max, Y_pred_test_max, color="blue", label="Test Data", alpha=0.6)
plt.scatter(Y_train_max, Y_pred_train_max, color="green", label="Train Data", alpha=0.3)

min_val, max_val = min(Y_test_max.min(), Y_pred_test_max.min()), max(Y_test_max.max(), Y_pred_test_max.max())
plt.plot([min_val, max_val], [min_val, max_val], color="red", linestyle="dashed", label="Ideal Fit")
plt.xlabel("Actual Max Temperature")
plt.ylabel("Predicted Max Temperature")
plt.title("Actual vs Predicted Max Temperatures")
plt.legend()

# Scatter plot for min temperature
plt.subplot(1, 2, 2)
plt.scatter(Y_test_min, Y_pred_test_min, color="blue", label="Test Data", alpha=0.6)
plt.scatter(Y_train_min, Y_pred_train_min, color="green", label="Train Data", alpha=0.3)

min_val, max_val = min(Y_test_min.min(), Y_pred_test_min.min()), max(Y_test_min.max(), Y_pred_test_min.max())
plt.plot([min_val, max_val], [min_val, max_val], color="red", linestyle="dashed", label="Ideal Fit")
plt.xlabel("Actual Min Temperature")
plt.ylabel("Predicted Min Temperature")
plt.title("Actual vs Predicted Min Temperatures")
plt.legend()

plt.tight_layout()
plt.show()

# #saving the model
# XGB_max.save_model("model_xgb_max.json")
# print("Model is saved!!")
# XGB_min.save_model("model_xgb_min.json")
# print("Model is saved!!")