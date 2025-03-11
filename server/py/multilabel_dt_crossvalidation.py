import sys
sys.path.insert(0, "/var/www/html/webkmeans/kclusterhub/multilabeldtree/miniconda3/envs/myenv/lib/python3.11/site-packages")
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

# Initialize KFold for cross-validation.
k = int(sys.argv[6])
kf = KFold(n_splits = k, random_state = None, shuffle = True)

# Getting unique labels for each column.
labels = classLabels.apply(lambda x: x.unique())

# Defining the multilabel classifiers.
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

    # Calculating the classifier with max_depth=None.
    if param_name == 'max_depth':
            none_max_depth = None
            none_hamming_loss = float('inf')
            hamming_losses = []
            for train_index, test_index in kf.split(attr):
                X_train, X_test = attr.iloc[train_index, :], attr.iloc[test_index, :]
                y_train, y_test = classLabels.iloc[train_index], classLabels.iloc[test_index]

                model = DecisionTreeClassifier(max_depth=None)
                classifier.classifier = model
                classifier.fit(X_train, y_train)
                predictions = classifier.predict(X_test)
                classifier.classifier.fit(X_train, y_train)
                hamming_loss = metrics.hamming_loss(y_test, predictions)
                hamming_losses.append(hamming_loss)

            none_hamming_loss = sum(hamming_losses) / k
            none_max_depth = classifier.classifier.get_depth() # Returning classifier's max_depth.

    # Calculating auto-selected parameters (max_depth or min_samples_leaf).
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

        if avg_hamming_loss < best_hamming_loss:
            best_hamming_loss = avg_hamming_loss
            best_param = i

    # Comparing auto-selected max_depth with the depth from max_depth=None.
    if param_name == 'max_depth':
        if none_max_depth < best_param:
            return none_max_depth, none_hamming_loss # Returning smaller max_depth from None param.
        else:
            return best_param, best_hamming_loss # Returning smaller auto-selected max_depth.
    
    # Returning auto-selected min_samples_leaf.
    if param_name == 'min_samples_leaf':
        return best_param, best_hamming_loss

best_classifier_name = None

# Auto classifier selection.
if sys.argv[7] == 'Auto':
    best_classifier = None
    best_hamming_loss = float('inf')

    for name, clf in classifiers.items():
        hamming_losses = []
        for train_index, test_index in kf.split(attr):
            X_train, X_test = attr.iloc[train_index, :], attr.iloc[test_index, :]
            y_train, y_test = classLabels.iloc[train_index], classLabels.iloc[test_index]

            clf.fit(X_train, y_train)
            predictions = clf.predict(X_test)

            hamming_loss = metrics.hamming_loss(y_test, predictions)
            hamming_losses.append(hamming_loss)
        
        avg_hamming_loss = sum(hamming_losses) / k
        
        if avg_hamming_loss < best_hamming_loss:
            best_hamming_loss = avg_hamming_loss
            best_classifier = clf
            best_classifier_name = name
    
    classifier = best_classifier # The best classifier. 

    # Auto min_samples_leaf selection.
    if min_samples_leaf == 'Auto':
        min_samples_leaf, best_hamming_loss = auto_select_param('min_samples_leaf', range(1, 50, 3), attr, classLabels, kf, classifier, k)
    else:
        min_samples_leaf = int(min_samples_leaf) # Specific min_samples_leaf selection.
    
    # Auto max_depth selection.
    if max_depth == 'Auto':
        max_depth, best_hamming_loss = auto_select_param('max_depth', range(1, 50, 3), attr, classLabels, kf, classifier, k)
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
        print(f"\nError: Unknown classifier type: {sys.argv[7]}")
        sys.exit(1)

    # Auto min_samples_leaf selection.
    if min_samples_leaf == 'Auto':
        min_samples_leaf, best_hamming_loss = auto_select_param('min_samples_leaf', range(1, 50, 3), attr, classLabels, kf, classifier, k)
    else:
        min_samples_leaf = int(min_samples_leaf) # Specific min_samples_leaf selection.
    
    # Auto max_depth selection.
    if max_depth == 'Auto':
        max_depth, best_hamming_loss = auto_select_param('max_depth', range(1, 50, 3), attr, classLabels, kf, classifier, k)
    elif max_depth == 'None': # None max_depth selection.
        max_depth = None
    else: 
        max_depth = int(max_depth) # Specific max_depth selection.

    classifier.classifier = DecisionTreeClassifier(max_depth=max_depth, min_samples_leaf=min_samples_leaf) # Final DTree parameters.

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
    predictions = classifier.predict(X_test)
    pred = classifier.predict(X_test).toarray() # Converting predictions to dense format.

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

# Calculating average metrics per label.
pre_per_label = [[round(sum(label_metrics) / k, 2) for label_metrics in zip(*label)] for label in arr_pre]
rec_per_label = [[round(sum(label_metrics) / k, 2) for label_metrics in zip(*label)] for label in arr_rec]
fsc_per_label = [[round(sum(label_metrics) / k, 2) for label_metrics in zip(*label)] for label in arr_fsc]

# Converting each column to a NumPy array and store them in a list.
label_arrays = [labels[column].to_numpy() for column in labels.columns]
# Converting the labels: From a list of NumPy arrays to a list of lists.
labels = [array.tolist() for array in label_arrays]

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
    "min_samples_leaf": min_samples_leaf,
    "k": k
}))