import sys
sys.path.insert(0, "./")
import joblib
import json

model_file = sys.argv[1]
joblib_model = joblib.load(model_file)

# Returning feature names (columns).
columns = joblib_model.classifier.feature_names_in_.tolist()

# Returning classifer type.
classifier_type = joblib_model.__class__.__name__ 

# Returning max_depth.
max_depth = joblib_model.classifier.max_depth

# Returning min_samples_leaf.
min_samples_leaf = joblib_model.classifier.min_samples_leaf

print(json.dumps({
    "columns": columns,
    "classifier_type": classifier_type,
    "max_depth": max_depth,
    "min_samples_leaf": min_samples_leaf
}))