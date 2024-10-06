import sys
import json
import numpy as np
import tensorflow as tf
import pandas as pd
import socket
import struct
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Input

def ip_to_int(ip):
    if isinstance(ip, str):  
        try:
            return struct.unpack("!I", socket.inet_aton(ip))[0]
        except socket.error:
            return 0  
    return 0  

model = Sequential([
    Input((11,)),
    Dense(64, activation='relu'), 
    Dense(32, activation='relu'),
    Dense(16, activation='relu'),
    Dense(1, activation='sigmoid')
])

model.load_weights("/Users/akashsavanur/Desktop/transaction-api/src/model/fraud_detection_model.h5") 

input_data = json.loads(sys.argv[1])

hour_bins = [-1, 6, 12, 18, 24]
hour_labels = ['Early Morning', 'Morning', 'Afternoon', 'Night']
input_data['hour'] = pd.cut([input_data['hour']], bins=hour_bins, labels=hour_labels, right=False)[0]

hour_mapping = {
    'Early Morning': 1,
    'Morning': 2,
    'Afternoon': 3,
    'Night': 4
}

input_data['hour'] = hour_mapping[input_data['hour']]

month_mapping = {
    'January': 1,
    'February': 2,
    'March': 3,
    'April': 4,
    'May': 5,
    'June': 6,
    'July': 7,
    'August': 8,
    'September': 9,
    'October': 10,
    'November': 11,
    'December': 12
}

if isinstance(input_data['month'], str):
    input_data['month'] = month_mapping.get(input_data['month'], 0)

input_data['IP'] = ip_to_int(input_data['IP'])

categorical_fields = ['method', 'category', 'customerLocation', 'device']
le = LabelEncoder()

for field in categorical_fields:
    input_data[field] = le.fit_transform([input_data[field]])[0]

features = np.array([
    input_data['amount'],          
    input_data['method'],          
    input_data['category'],        
    input_data['quantity'],        
    input_data['customerAge'],     
    input_data['customerLocation'],
    input_data['device'],          
    input_data['IP'],             
    input_data['day'],           
    input_data['month'],         
    input_data['hour']       
]).reshape(1, -1)

prediction = model.predict(features)
with open("log.txt", "w+") as file:
    file.write(str(prediction))


is_fraud = int(prediction[0][0] > 0.5)  

print(json.dumps({"is_fraud": is_fraud}))
