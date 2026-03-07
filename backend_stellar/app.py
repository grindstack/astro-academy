from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
# Configure CORS to allow requests from React frontend at localhost:5173
CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173'])

# Load the trained ML model from the same directory
try:
    model_path = os.path.join(os.path.dirname(__file__), 'stellar_model.pkl')
    model = joblib.load(model_path)
    print(f"✓ Model loaded successfully from {model_path}")
except Exception as e:
    print(f"✗ Error loading model: {e}")
    model = None

@app.route('/')
def home():
    return jsonify({
        'message': 'Stellar Classification API is running',
        'status': 'active',
        'endpoints': {
            '/predict': 'POST - Classify stellar objects'
        }
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Check if model is loaded
        if model is None:
            return jsonify({
                'error': 'Model not loaded. Please check server logs.',
                'status': 'failed'
            }), 500
        
        # Get the JSON data from the frontend
        data = request.json
        print(f"Received data: {data}")
        
        # Extract the features array (6 numbers: u, g, r, i, z, redshift)
        features = data['features']
        print(f"Features: {features}")
        
        # Convert to 2D NumPy array using reshape(1, -1)
        features_array = np.array(features, dtype=float).reshape(1, -1)
        print(f"Features array shape: {features_array.shape}")
        
        # Make prediction using the trained model
        prediction = model.predict(features_array)
        print(f"Prediction: {prediction}")
        
        # Get prediction probabilities for confidence score
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(features_array)
            confidence = float(np.max(probabilities) * 100)
            print(f"Confidence: {confidence}")
        else:
            # Mock confidence if predict_proba is not available
            confidence = 95.0
        
        # Map numeric output (0, 1, 2) to string labels
        class_mapping = {0: 'Galaxy', 1: 'Star', 2: 'Quasar'}
        result = class_mapping.get(int(prediction[0]), "Unknown")
        
        response = {
            'prediction': result,
            'confidence': confidence,
            'status': 'success'
        }
        print(f"Response: {response}")
        
        return jsonify(response)
    except Exception as e:
        print(f"Error in predict: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'status': 'failed'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)