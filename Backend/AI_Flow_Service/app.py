from flask import Flask, request, jsonify
from controllers.rag_controller import handle_query
from controllers.ingest_controller import ingest_order_data
from kafka_consumer import start_rag_consumer

app = Flask(__name__)

@app.route('/rag/query', methods=['POST'])
def query_rag():
    data = request.json
    user_query = data.get("query")
    user_email = data.get("email")
    if not user_query or not user_email:
        return jsonify({"error": "Missing query or email"}), 400
    return handle_query(user_query, user_email)

@app.route('/ingest/order', methods=['POST'])
def ingest_order():
    data = request.json
    return ingest_order_data(data)

if __name__ == '__main__':
    app.run(debug=True, port=5015)
    start_rag_consumer()
