import sys
import json

def infer_image(file_path):
    # Load your image model and perform inference
    # Example: result = model.predict(file_path)
    result = {"fake_probability": 0.85, "real_probability": 0.15}  # Mock result
    return result

if __name__ == "__main__":
    file_path = sys.argv[1]
    result = infer_image(file_path)
    print(json.dumps(result))