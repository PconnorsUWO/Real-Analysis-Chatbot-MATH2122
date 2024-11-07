from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
import json
import numpy as np
from scipy.spatial.distance import cosine

app = Flask(__name__)
CORS(app)


openai.api_key = os.getenv("OPENAI_API_KEY")

if not openai.api_key:
    raise ValueError("OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.")


VECTOR_STORE_FILES = [
    'data/default__vector_store.json',
    'data/docstore.json',
    'data/graph_store.json',
    'data/image__vector_store.json',
    'data/index_store.json'
]

vectors = []
metadata = []

for file_path in VECTOR_STORE_FILES:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for entry in data:
                vectors.append(entry['vector'])
                metadata.append({
                    'text': entry['text'],
                    'reference': entry['reference']
                })
        print(f"Loaded {len(data)} entries from {file_path}")
    except Exception as e:
        print(f"Error loading {file_path}: {e}")

vectors = np.array(vectors)
metadata = np.array(metadata)

vectors_norm = vectors / np.linalg.norm(vectors, axis=1, keepdims=True)


def get_embedding(text):
    """
    Get the embedding of the input text using OpenAI's embedding API.
    """
    try:
        response = openai.Embedding.create(
            input=text,
            model="text-embedding-ada-002"  
        )
        embedding = response['data'][0]['embedding']
        return embedding
    except Exception as e:
        print(f"Error obtaining embedding: {e}")
        return None

def find_similar(query_embedding, vectors, top_k=5):

    query_embedding = np.array(query_embedding)
    query_norm = query_embedding / np.linalg.norm(query_embedding)

    similarities = np.dot(vectors, query_norm)

    top_indices = similarities.argsort()[-top_k:][::-1]
    return top_indices

def retrieve_relevant_passages(question, top_k=5):

    query_embedding = get_embedding(question)
    if query_embedding is None:
        return []

    top_indices = find_similar(query_embedding, vectors_norm, top_k)

    relevant_passages = []
    for idx in top_indices:
        passage = metadata[idx]
        relevant_passages.append(passage)

    return relevant_passages



@app.route('/generate-response', methods=['POST'])
def generate_response():

    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    question = data.get("question")

    if not question:
        return jsonify({"error": "Question not provided"}), 400

    try:
        relevant_passages = retrieve_relevant_passages(question, top_k=5)

        if not relevant_passages:
            return jsonify({"error": "No relevant information found."}), 404

        context = ""
        for passage in relevant_passages:
            context += f"{passage['text']} (Reference: {passage['reference']})\n\n"

        prompt = (
            "You are an assistant specialized in Real Analysis. "
            "Use the following information to answer the question. "
            "Provide references to the relevant sections of the textbook.\n\n"
            "At the end of your own response reply with exactly. 'This is possibly found in chapter " + passage["chapter"] + " page " + passage["page"] + " of your text book'"
            f"Context:\n{context}\n"
            f"Question: {question}\n"
            "Answer:"
        )

        response = openai.completions.create(
            model="gpt-4",  
            messages=[
                {"role": "system", "content": "You are an assistant specialized in Real Analysis."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7  
        )

        answer = response['choices'][0]['message']['content'].strip()

 
        return jsonify({"response": answer})

    except openai.error.AuthenticationError:
        return jsonify({"error": "Authentication with OpenAI failed. Check your API key."}), 401

    except openai.error.RateLimitError:
        return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429

    except openai.error.OpenAIError as e:
        return jsonify({"error": f"OpenAI API error: {e}"}), 500

    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
