from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
import numpy as np
import pandas as pd
import joblib # Untuk memuat scaler
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Mengaktifkan CORS untuk semua rute

# Muat model LSTM yang telah disimpan
try:
    model_lstm = load_model('actual_trained_lstm_model.h5')
    print("Model LSTM berhasil dimuat.")
except Exception as e:
    print(f"Error memuat model LSTM: {e}")
    model_lstm = None

# Muat kamus scalers
try:
    scalers_dict = joblib.load('scalers_lstm.pkl')
    print("Kamus scalers berhasil dimuat.")
except Exception as e:
    print(f"Error memuat scalers: {e}")
    scalers_dict = None

# Muat data historis yang telah diproses
try:
    df_historical = pd.read_csv('katalog_gempa_processed_for_flask.csv')
    df_historical['tgl'] = pd.to_datetime(df_historical['tgl'])
    print("Data historis berhasil dimuat.")
except Exception as e:
    print(f"Error memuat data historis: {e}")
    df_historical = None

# Fitur yang digunakan oleh model LSTM
LSTM_FEATURES = ['day', 'month', 'day_of_year', 'depth', 'mag']
SEQUENCE_LENGTH = 30 # Sesuaikan dengan window size saat training LSTM

@app.route('/predict_lstm', methods=['POST'])
def predict_lstm():
    if not model_lstm or not scalers_dict or df_historical is None:
        return jsonify({"error": "Model, scaler, atau data historis tidak berhasil dimuat. Periksa log server."}), 500

    if request.content_type != 'application/json':
        return jsonify({"error": "Content-Type must be application/json"}), 415
    
    try:
        data = request.get_json()
        provinsi_input = data.get('provinsi')

        if not provinsi_input:
            return jsonify({"error": "Nama provinsi dibutuhkan"}), 400

        if provinsi_input not in scalers_dict:
            return jsonify({"error": f"Scaler untuk provinsi '{provinsi_input}' tidak ditemukan. Provinsi mungkin tidak ada dalam data training atau tidak memiliki cukup data."}), 400
        
        # 1. Ambil data historis untuk provinsi yang dipilih
        prov_df = df_historical[df_historical['provinsi'] == provinsi_input].copy()
        prov_df = prov_df.sort_values('tgl').reset_index(drop=True)

        if len(prov_df) < SEQUENCE_LENGTH:
            return jsonify({"error": f"Data historis untuk provinsi '{provinsi_input}' tidak mencukupi (kurang dari {SEQUENCE_LENGTH} record)."}), 400

        # 2. Ambil 30 record terakhir untuk fitur yang dibutuhkan
        recent_data_features = prov_df.tail(SEQUENCE_LENGTH)[LSTM_FEATURES]

        # 3. Gunakan scaler yang sesuai dari kamus
        scaler_prov = scalers_dict[provinsi_input]
        
        # Penskalaan fitur
        # Scaler dari notebook di-fit pada (group[features]) yang memiliki kolom ['day', 'month', 'day_of_year', 'depth', 'mag']
        # Jadi, recent_data_features harus memiliki kolom yang sama dan urutan yang sama.
        try:
            recent_scaled = scaler_prov.transform(recent_data_features.to_numpy())
        except ValueError as ve:
             # Ini bisa terjadi jika jumlah fitur tidak cocok atau ada NaN setelah transform
            return jsonify({"error": f"Error saat penskalaan data untuk provinsi '{provinsi_input}': {ve}. Pastikan fitur input konsisten."}), 500


        # 4. Reshape data untuk input LSTM (1 sample, 30 timesteps, 5 fitur)
        input_sequence = np.expand_dims(recent_scaled, axis=0)

        # 5. Lakukan prediksi
        prediction_proba_lstm = model_lstm.predict(input_sequence)
        
        probability = float(prediction_proba_lstm[0][0])
        earthquake_prediction = 1 if probability >= 0.5 else 0

        result = {
            "Provinsi": provinsi_input,
            "Probabilitas_Gempa_30_Hari": probability,
            "Prediksi_Gempa": earthquake_prediction,
            "Message": "Prediksi berdasarkan 30 hari data historis terakhir untuk provinsi ini."
        }

        return jsonify(result)
    
    except KeyError as ke:
        return jsonify({"error": f"Key error: {ke}. Pastikan nama provinsi benar dan ada dalam data."}), 400
    except Exception as e:
        print(f"Terjadi kesalahan: {e}") # Untuk debugging di server
        return jsonify({"error": f"Terjadi kesalahan internal: {e}"}), 500

if __name__ == '__main__':
    app.run(debug=True)