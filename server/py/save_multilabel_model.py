import sys
sys.path.insert(0, "/var/www/html/webkmeans/kclusterhub/multilabeldtree/miniconda3/envs/myenv/lib/python3.11/site-packages")
import pandas as pd
from skmultilearn.problem_transform import LabelPowerset, BinaryRelevance, ClassifierChain
from sklearn.tree import DecisionTreeClassifier
import json
import joblib

# Defining parameters.
file_path  = sys.argv[1] # dataset path.
selectedFeatures = sys.argv[2].split(',') # selected features.
selectedLabels = sys.argv[3].split(',') # selected labels.
max_depth = sys.argv[4] # selected max depth.
if max_depth == 'None':
    max_depth = None
else:
    max_depth = int(max_depth)
min_samples_leaf = int(sys.argv[5]) # selected min samples leaf.

dataset = pd.read_csv(file_path)
res = [sub.replace(' ', '_') for sub in dataset.columns]    
dataset.columns = res   

# Attributes/Features & Labels.
attr = dataset[selectedFeatures]
classLabels = dataset[selectedLabels]

model_trf = sys.argv[6] # given model trf name. 
model_path = sys.argv[7] # given model path name. 

# Defining the multilabel classifiers.
classifiers = {
    'BinaryRelevance': BinaryRelevance(
        classifier=DecisionTreeClassifier(max_depth=max_depth, min_samples_leaf=min_samples_leaf),
        require_dense=[False, True]  # X: dense, y: sparse.
    ),
    'LabelPowerset': LabelPowerset(
        classifier=DecisionTreeClassifier(max_depth=max_depth, min_samples_leaf=min_samples_leaf),
        require_dense=[False, True] # X: dense, y: sparse.
    ),
    'ClassifierChain': ClassifierChain(
        classifier=DecisionTreeClassifier(max_depth=max_depth, min_samples_leaf=min_samples_leaf),
        require_dense=[False, True] # X: dense, y: sparse.
    )
}

classifier = classifiers.get(sys.argv[8]) # selected classifier.

classifier.fit(attr, classLabels)
joblib.dump(classifier, model_trf)
classifier.classifier.fit(attr, classLabels)
joblib.dump(classifier, model_path)

print(json.dumps({"message": "Model successfully saved."}))