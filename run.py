import os
import sys

# Ensure project root is in python sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.app import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"====================================================")
    print(f" PlacementHub Flask API Server listening on port {port}")
    print(f" - Health check: http://localhost:{port}/api/health")
    print(f" - API base:     http://localhost:{port}/api")
    print(f"====================================================")
    app.run(host='0.0.0.0', port=port, debug=False)
