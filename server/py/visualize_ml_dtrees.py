import sys
sys.path.insert(0, "/var/www/html/webkmeans/kclusterhub/multilabeldtree/.venv/lib/python3.11/site-packages")
from sklearn import tree
import joblib
import json

model_trf = sys.argv[1] # model trf name.
model_file = sys.argv[2] # model name.
tree_path = sys.argv[3] # tree path name.

joblib_model_trf = joblib.load(model_trf)
joblib_model = joblib.load(model_file)

# Returning classifer type.
classifier_type = joblib_model_trf.__class__.__name__

# Returning feature names.
features = joblib_model.classifier.feature_names_in_.tolist()

# Returning label values.
labels = joblib_model.classifier.classes_

# Creating the DTrees based on classifier type selection.
match classifier_type:
    case 'BinaryRelevance':
        # Converting label values from int to strings for DTree plot representation.
        labels_strings = [[str(item) for item in sublist] for sublist in labels]

        for i, n_tree in enumerate(joblib_model_trf.classifiers_):
            tree_path2 = f"{tree_path}_{i + 1}.dot"
            dot_data = tree.export_graphviz(n_tree, out_file = tree_path2, feature_names = features, class_names = labels_strings[i], filled = True, node_ids = True, rounded = True, precision = 2, max_depth = 10)
    
    case 'LabelPowerset':
        # Converting label's unique combinations to strings for DTree plot representation.
        label_combinations = [str(combination) for combination in joblib_model_trf.unique_combinations_]

        # Label Powerset creates only one DTree.
        n_tree = joblib_model_trf.classifier

        tree_path2 = tree_path + ".dot"
        dot_data = tree.export_graphviz(n_tree, out_file = tree_path2, feature_names = features, class_names = label_combinations, filled = True, node_ids = True, rounded = True, precision = 2, max_depth = 10)
    
    case 'ClassifierChain':
        # Converting label values from int to strings for DTree plot representation.
        labels_strings = [[str(item) for item in sublist] for sublist in labels]

        for i, n_tree in enumerate(joblib_model_trf.classifiers_):
            # Start with the original feature names.
            feature_names = list(features)  

            # Extend feature names to include previous DTree results.
            if i > 0: # Using `i > 0` to skip adding anything for the first DTree.
                feature_names += [features[j] for j in range(i)]

            tree_path2 = f"{tree_path}_{i + 1}.dot"
            dot_data = tree.export_graphviz(n_tree, out_file = tree_path2, feature_names = feature_names, class_names = labels_strings[i], filled = True, node_ids = True, rounded = True, precision = 2, max_depth = 10)
    
print(json.dumps({"message": "Dot data for DTrees created successfully."}))