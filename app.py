import os
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from flask import Flask, render_template, request, jsonify
import xgboost as xgb
from flask_cors import CORS



app = Flask(__name__)
CORS(app)
# Load the saved models
model_xg_max = xgb.XGBRegressor()
model_xg_min = xgb.XGBRegressor()

# Check if models exist and load them
if os.path.exists("model_xgb_max.json"):
    model_xg_max.load_model("model_xgb_max.json")
else:
    print("Warning: model_xgb_max.json not found")

if os.path.exists("model_xgb_min.json"):
    model_xg_min.load_model("model_xgb_min.json")
else:
    print("Warning: model_xgb_min.json not found")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    try:
        data = request.get_json()
        date_str = data['date']
        
        # Parse the date
        selected_date = datetime.strptime(date_str, '%Y-%m-%d')
        
        # Extract date features
        features = {
            'Day_of_week': selected_date.weekday(),
            'Quarter': (selected_date.month - 1) // 3 + 1,
            'Month': selected_date.month,
            'Year': selected_date.year,
            'Day_of_Year': int(selected_date.strftime('%j')),
            'Day_of_month': selected_date.day,
            'Week_of_Year': int(selected_date.strftime('%U'))
        }
        
        # Convert to DataFrame for prediction
        df = pd.DataFrame([features])
        
        # Make predictions
        max_temp_pred = model_xg_max.predict(df)[0]
        min_temp_pred = model_xg_min.predict(df)[0]
        
        return jsonify({
            'max_temp': round(float(max_temp_pred), 2),
            'min_temp': round(float(min_temp_pred), 2),
            'date': date_str
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# @app.route('/metrics')
# def get_metrics():
#     return jsonify(metrics)

@app.route('/forecast', methods=['GET','POST'])
def forecast():
    try:
        data = request.get_json()
        start_date_str = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        # Parse the start date
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        
        forecast_results = []
        
        # Generate 7-day forecast
        for i in range(7):
            forecast_date = start_date + timedelta(days=i)
            
            # Extract features
            features = {
                'Day_of_week': forecast_date.weekday(),
                'Quarter': (forecast_date.month - 1) // 3 + 1,
                'Month': forecast_date.month,
                'Year': forecast_date.year,
                'Day_of_Year': int(forecast_date.strftime('%j')),
                'Day_of_month': forecast_date.day,
                'Week_of_Year': int(forecast_date.strftime('%U'))
            }
            
            # Convert to DataFrame
            df = pd.DataFrame([features])
            
            # Make predictions
            max_temp_pred = model_xg_max.predict(df)[0]
            min_temp_pred = model_xg_min.predict(df)[0]
            
            forecast_results.append({
                'date': forecast_date.strftime('%Y-%m-%d'),
                'day': forecast_date.strftime('%A'),
                'max_temp': round(float(max_temp_pred), 2),
                'min_temp': round(float(min_temp_pred), 2)
            })
        
        return jsonify(forecast_results)
    except Exception as e:
        return jsonify({'error': str(e)}), 400
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
   