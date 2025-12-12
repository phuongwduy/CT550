from flask import Flask, request, jsonify
import torch
import clip
from PIL import Image
from io import BytesIO

app = Flask(__name__)
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

@app.route("/embed-image", methods=["POST"])
def embed_image():
    if "file" not in request.files:
        return jsonify({"error": "No file"}), 400
    file = request.files["file"]
    image = Image.open(BytesIO(file.read())).convert("RGB")

    with torch.no_grad():
        img_tensor = preprocess(image).unsqueeze(0).to(device)
        feats = model.encode_image(img_tensor)
        feats = feats / feats.norm(dim=-1, keepdim=True)
        vec = feats.cpu().numpy()[0].tolist()
    print("Embedding sample:", vec[:10])
    return jsonify({"embedding": vec})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001)
