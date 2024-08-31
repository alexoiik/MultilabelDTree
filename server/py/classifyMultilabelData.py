import sys
sys.path.insert(0, "./")
import pandas as pd
import joblib
import json
from sklearn import metrics

# Defining parameters.
file_path  = sys.argv[1] # dataset path.
selectedFeatures = sys.argv[2].split(',') # selected features.
model_path = sys.argv[3] # model path.
save_path = sys.argv[4] # save path.
selectedLabels = sys.argv[5].split(',') # selected labels.
if selectedLabels == 'None':
    selectedLabels = None

dataset = pd.read_csv(file_path)
res = [sub.replace(' ', '_') for sub in dataset.columns]
dataset.columns = res

# Attributes/Features.
attr = dataset[selectedFeatures]
classLabels = dataset[selectedLabels]

model = joblib.load(model_path)
model.fit(attr, classLabels)
predictions = model.predict(attr)

# Initialize list of lists to store metrics for each class label.
arr_pre = [[] for _ in range(len(selectedLabels))]
arr_rec = [[] for _ in range(len(selectedLabels))]
arr_fsc = [[] for _ in range(len(selectedLabels))]

pre_per_label = [[] for _ in range(len(selectedLabels))]
rec_per_label = [[] for _ in range(len(selectedLabels))]
fsc_per_label = [[] for _ in range(len(selectedLabels))]

if selectedLabels != None:
    # Getting unique labels for each column.
    labels = classLabels.apply(lambda x: x.unique())

    pred = predictions.toarray()  # Convert predictions to dense format.

    # Calculating precision, recall, and f-score for each class label.
    for i, label in enumerate(selectedLabels):
        unique_values = classLabels[label].unique()
        pre, rec, fsc, _ = metrics.precision_recall_fscore_support(classLabels[label], pred[:, i], average=None, zero_division=0.0, labels = unique_values)
        arr_pre[i].append(pre)
        arr_rec[i].append(rec)
        arr_fsc[i].append(fsc)

    # Store precision, recall, and f-score for each class label to a list of lists.
    for i in range(len(arr_pre)):
        if len(arr_pre[i]) > 0:
            pre_per_label[i] = [round(val, 2) for val in arr_pre[i][0]]
            
    for i in range(len(arr_rec)):
        if len(arr_rec[i]) > 0:
            rec_per_label[i] = [round(val, 2) for val in arr_rec[i][0]]

    for i in range(len(arr_fsc)):
        if len(arr_fsc[i]) > 0:
            fsc_per_label[i] = [round(val, 2) for val in arr_fsc[i][0]]

    # Calculating evaluation metrics.
    hamming_loss = metrics.hamming_loss(classLabels, predictions)
    accuracy = metrics.accuracy_score(classLabels, predictions)
    precision, recall, fscore, _ = metrics.precision_recall_fscore_support(classLabels, predictions, average='macro', zero_division=0.0)

    # Rounding evaluation metrics.
    avg_hl = round(hamming_loss, 2)
    avg_acc = round(accuracy, 2)
    avg_pre = round(precision, 2)
    avg_rec = round(recall, 2)
    avg_fsc = round(fscore, 2)

    # Converting each column to a NumPy array and store them in a list.
    label_arrays = [labels[column].to_numpy() for column in labels.columns]
    # Converting the labels: From a list of NumPy arrays to a list of lists.
    labels = [array.tolist() for array in label_arrays]

# Iterating through each column and add it to the DataFrame.
for i in range(pred.shape[1]):
    column_name = f'predictions_L{i + 1}'
    dataset[column_name] = pred[:, i]

# Updating the selectedFeatures list to include the new columns.
cols = selectedFeatures + [f'predictions_L{i + 1}' for i in range(pred.shape[1])]
dataset[cols].to_csv(save_path, index = False, encoding = 'utf-8')

columns = dataset[cols].columns.to_list()
rows = dataset[cols].values.tolist()
data = []
data.append(columns)
for i in range(len(rows)):
    data.append(rows[i])

print(json.dumps({
    "dataset": data, 
    "avg_hl": avg_hl, 
    "avg_acc": avg_acc, 
    "avg_pre": avg_pre, 
    "avg_rec": avg_rec, 
    "avg_fsc": avg_fsc, 
    "pre_per_label": pre_per_label, 
    "rec_per_label": rec_per_label, 
    "fsc_per_label": fsc_per_label, 
    "labels": labels
}))