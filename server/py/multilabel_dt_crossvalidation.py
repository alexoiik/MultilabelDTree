import sys
sys.path.insert(0, "./")
import pandas as pd
from skmultilearn.problem_transform import LabelPowerset, BinaryRelevance, ClassifierChain
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import KFold
from sklearn import metrics
import json

# Defining parameters.
file_path  = sys.argv[1] # dataset path.
selectedFeatures = sys.argv[2].split(',') # selected features.
selectedLabels = sys.argv[3].split(',') # selected labels.
max_depth = sys.argv[4] # selected max depth.
min_samples_leaf = sys.argv[5] # selected min samples leaf.
    
dataset = pd.read_csv(file_path)
res = [sub.replace(' ', '_') for sub in dataset.columns]
dataset.columns = res   

# Attributes/Features & Labels.
attr = dataset[selectedFeatures]
classLabels = dataset[selectedLabels]

# Convert byte strings to integers for specific columns.
def convert_byte_string_to_int(x):
    if isinstance(x, str) and x.startswith("b'"):
        return int(x.strip("b'"))
    return x

attr = attr.map(convert_byte_string_to_int)
classLabels = classLabels.map(convert_byte_string_to_int)

# Initialize KFold for cross-validation.
k = int(sys.argv[6])
kf = KFold(n_splits = k, random_state = None, shuffle = True)

# Getting unique labels for each column.
labels = classLabels.apply(lambda x: x.unique())

# print("\n10-row Dataset preview:\n", dataset.head())
# print("\nSelected Features:\n", attr)
# print("\nSelected Labels:\n", classLabels)
# print("\nUnique Labels values:\n", labels, "\n")
# print("\nSelected max_depth:", max_depth)
# print("Selected min_samples_leaf:", min_samples_leaf)
# print("Selected k for cross-validation:", k)
# print("Selected classifier:", sys.argv[7], "\n")

# Define the multilabel classifiers.
classifiers = {
    'BinaryRelevance': BinaryRelevance(
        classifier=DecisionTreeClassifier(), # Initializing empty parameters.
        require_dense=[False, True]  # X: dense, y: sparse.
    ),
    'LabelPowerset': LabelPowerset(
        classifier=DecisionTreeClassifier(), # Initializing empty parameters.
        require_dense=[False, True] # X: dense, y: sparse.
    ),
    'ClassifierChain': ClassifierChain(
        classifier=DecisionTreeClassifier(), # Initializing empty parameters.
        require_dense=[False, True] # X: dense, y: sparse.
    )
}

# Function for auto max_depth & min_samples_leaf parameters.
def auto_select_param(param_name, param_range, attr, classLabels, kf, classifier, k):
    best_param = None
    best_hamming_loss = float('inf')

    # print(f"> Testing {param_name}:")
    for i in param_range:
        hamming_losses = []
        for train_index, test_index in kf.split(attr):
            X_train, X_test = attr.iloc[train_index, :], attr.iloc[test_index, :]
            y_train, y_test = classLabels.iloc[train_index], classLabels.iloc[test_index]

            model = DecisionTreeClassifier(**{param_name: i})
            classifier.classifier = model
            classifier.fit(X_train, y_train)
            predictions = classifier.predict(X_test)
            hamming_loss = metrics.hamming_loss(y_test, predictions)
            hamming_losses.append(hamming_loss)

        avg_hamming_loss = sum(hamming_losses) / k
        # print(f'{param_name}: {i}, Avg Hamming Loss: {avg_hamming_loss}')

        if avg_hamming_loss < best_hamming_loss:
            best_hamming_loss = avg_hamming_loss
            best_param = i

    return best_param, best_hamming_loss

best_classifier_name = None

# Auto classifier selection.
if sys.argv[7] == 'Auto':
    best_classifier = None
    best_hamming_loss = float('inf')

    # print("> Testing classifiers:")
    for name, clf in classifiers.items():
        hamming_losses = []
        for train_index, test_index in kf.split(attr):
            X_train, X_test = attr.iloc[train_index, :], attr.iloc[test_index, :]
            y_train, y_test = classLabels.iloc[train_index], classLabels.iloc[test_index]

            clf.fit(X_train, y_train)

            # Fitting the base DTree classifier also, when needed.
            if(best_classifier_name == 'RakelD'): 
                clf.base_classifier.fit(X_train, y_train)
            if(best_classifier_name == 'LabelSpacePartitioning'):
                clf.classifier.fit(X_train, y_train)

            predictions = clf.predict(X_test)

            hamming_loss = metrics.hamming_loss(y_test, predictions)
            hamming_losses.append(hamming_loss)
        
        avg_hamming_loss = sum(hamming_losses) / k
        # print(f'Classifier: {name}, Avg Hamming Loss: {avg_hamming_loss}')
        
        if avg_hamming_loss < best_hamming_loss:
            best_hamming_loss = avg_hamming_loss
            best_classifier = clf
            best_classifier_name = name
    
    classifier = best_classifier # The best classifier. 
    # print(f'\nBest Classifier: {best_classifier_name} with Avg Hamming Loss: {best_hamming_loss}\n')

    # Auto min_samples_leaf selection.
    if min_samples_leaf == 'Auto':
        min_samples_leaf, best_hamming_loss = auto_select_param('min_samples_leaf', range(5, 50, 3), attr, classLabels, kf, classifier, k)
        # print(f'\nBest min_samples_leaf: {min_samples_leaf} with Avg Hamming Loss: {best_hamming_loss}\n')
    else:
        min_samples_leaf = int(min_samples_leaf) # Specific min_samples_leaf selection.
    
    # Auto max_depth selection.
    if max_depth == 'Auto':
        max_depth, best_hamming_loss = auto_select_param('max_depth', range(5, 50, 3), attr, classLabels, kf, classifier, k)
        # print(f'\nBest max_depth: {max_depth} with Avg Hamming Loss: {best_hamming_loss}')
    elif max_depth == 'None': # None max_depth selection.
        max_depth = None
    else: 
        max_depth = int(max_depth) # Specific max_depth selection.

    classifier.classifier = DecisionTreeClassifier(max_depth=max_depth, min_samples_leaf=min_samples_leaf) # Final DTree parameters.

else: # Specific classifier selection.
    classifier = classifiers.get(sys.argv[7])
    best_classifier_name = sys.argv[7]
    
    # Unkown classifier message interrupt.
    if classifier is None:
        # print(f"\nError: Unknown classifier type: {sys.argv[7]}")
        sys.exit(1)

      # Auto min_samples_leaf selection.
    if min_samples_leaf == 'Auto':
        min_samples_leaf, best_hamming_loss = auto_select_param('min_samples_leaf', range(5, 50, 3), attr, classLabels, kf, classifier, k)
        # print(f'\nBest min_samples_leaf: {min_samples_leaf} with Avg Hamming Loss: {best_hamming_loss}\n')
    else:
        min_samples_leaf = int(min_samples_leaf) # Specific min_samples_leaf selection.
    
    # Auto max_depth selection.
    if max_depth == 'Auto':
        max_depth, best_hamming_loss = auto_select_param('max_depth', range(5, 50, 3), attr, classLabels, kf, classifier, k)
        # print(f'\nBest max_depth: {max_depth} with Avg Hamming Loss: {best_hamming_loss}')
    elif max_depth == 'None': # None max_depth selection.
        max_depth = None
    else: 
        max_depth = int(max_depth) # Specific max_depth selection.

    classifier.classifier = DecisionTreeClassifier(max_depth=max_depth, min_samples_leaf=min_samples_leaf) # Final DTree parameters.

# print("\nFinal Classifier:", classifier)

# Initialize list of lists to store metrics for each class label.
arr_pre = [[] for _ in range(len(selectedLabels))]
arr_rec = [[] for _ in range(len(selectedLabels))]
arr_fsc = [[] for _ in range(len(selectedLabels))]

pre_per_label = [[] for _ in range(len(selectedLabels))]
rec_per_label = [[] for _ in range(len(selectedLabels))]
fsc_per_label = [[] for _ in range(len(selectedLabels))]

# Lists to store metrics for each fold.
hamming_losses = []
accuracy_scores = []
precision_scores = []
recall_scores = []
f_scores = []

# Performing k-fold cross-validation.
for train_index, test_index in kf.split(attr):
    X_train, X_test = attr.iloc[train_index, :], attr.iloc[test_index, :]
    y_train, y_test = classLabels.iloc[train_index], classLabels.iloc[test_index]
     
    classifier.fit(X_train, y_train) 

    # Fitting the base DTree classifier also, when needed.
    if(best_classifier_name == 'RakelD'): 
        classifier.base_classifier.fit(X_train, y_train)
    if(best_classifier_name == 'LabelSpacePartitioning'):
        classifier.classifier.fit(X_train, y_train)

    predictions = classifier.predict(X_test)
    
    if(best_classifier_name == 'MajorityVoting'):
        pred = predictions # Don't convert predictions to dense format.
    else:
        pred = classifier.predict(X_test).toarray() # Convert predictions to dense format.

    # Calculating precision, recall, and f-score for each class label.
    for i, label in enumerate(selectedLabels):
        unique_values = y_test[label].unique()
        pre, rec, fsc, _ = metrics.precision_recall_fscore_support(y_test[label], pred[:, i], average=None, zero_division=0.0, labels = unique_values)
        arr_pre[i].append(pre)
        arr_rec[i].append(rec)
        arr_fsc[i].append(fsc)
        
    # Calculating evaluation metrics.
    hamming_loss = metrics.hamming_loss(y_test, predictions)
    accuracy = metrics.accuracy_score(y_test, predictions)
    precision, recall, fscore, _ = metrics.precision_recall_fscore_support(y_test, predictions, average='macro', zero_division=0.0)

    hamming_losses.append(hamming_loss)
    accuracy_scores.append(accuracy)
    precision_scores.append(precision)
    recall_scores.append(recall)
    f_scores.append(fscore)

# Calculating average metrics.
avg_hamming_loss = sum(hamming_losses) / k
avg_hamming_loss = round(avg_hamming_loss, 2)
avg_accuracy = sum(accuracy_scores) / k
avg_accuracy = round(avg_accuracy, 2)
avg_precision = sum(precision_scores) / k
avg_precision = round(avg_precision, 2)
avg_recall = sum(recall_scores) / k
avg_recall = round(avg_recall, 2)
avg_f1_score = sum(f_scores) / k
avg_f1_score = round(avg_f1_score, 2)

# print('\nAvg Hamming Loss: {}'.format(avg_hamming_loss))
# print('Avg Accuracy: {}'.format(avg_accuracy))
# print('Avg Precision: {}'.format(avg_precision))
# print('Avg Recall: {}'.format(avg_recall))
# print('Avg F1-score: {}'.format(avg_f1_score))

# Calculating average metrics per label.
pre_per_label = [[round(sum(label_metrics) / k, 2) for label_metrics in zip(*label)] for label in arr_pre]
rec_per_label = [[round(sum(label_metrics) / k, 2) for label_metrics in zip(*label)] for label in arr_rec]
fsc_per_label = [[round(sum(label_metrics) / k, 2) for label_metrics in zip(*label)] for label in arr_fsc]

# Converting each column to a NumPy array and store them in a list.
label_arrays = [labels[column].to_numpy() for column in labels.columns]
# Converting the labels: From a list of NumPy arrays to a list of lists.
labels = [array.tolist() for array in label_arrays]

# print('\n')
print(json.dumps({
    "avg_hl": avg_hamming_loss, 
    "avg_acc": avg_accuracy, 
    "avg_pre": avg_precision, 
    "avg_rec": avg_recall, 
    "avg_fsc": avg_f1_score, 
    "pre_per_label": pre_per_label, 
    "rec_per_label": rec_per_label, 
    "fsc_per_label": fsc_per_label, 
    "labels": labels,
    "classifier": best_classifier_name,
    "max_depth": max_depth,
    "min_samples_leaf": min_samples_leaf
}))