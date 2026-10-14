import os
from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import Config
from backend.database import init_db, test_database_connection, setup_database_tables

# Import blueprints
from backend.routes.auth_routes import auth_bp
from backend.routes.drives_routes import drives_bp
from backend.routes.jobs_routes import jobs_bp
from backend.routes.internships_routes import internships_bp
from backend.routes.training_routes import training_bp
from backend.routes.attendance_routes import attendance_bp
from backend.routes.certifications_routes import certifications_bp
from backend.routes.exams_routes import exams_bp
from backend.routes.queries_routes import queries_bp
from backend.routes.reviews_routes import reviews_bp
from backend.routes.announcements_routes import announcements_bp
from backend.routes.notifications_routes import notifications_bp
from backend.routes.profile_routes import profile_bp
from backend.routes.admin_routes import admin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configure CORS for Vite dev server and general origins
    CORS(
        app,
        resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5000", "*"]}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    # Initialize Database with SQLite configuration
    init_db(app)

    # Register API Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(drives_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(internships_bp)
    app.register_blueprint(training_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(certifications_bp)
    app.register_blueprint(exams_bp)
    app.register_blueprint(queries_bp)
    app.register_blueprint(reviews_bp)
    app.register_blueprint(announcements_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(admin_bp)

    # Health Check Endpoint - reports the actual active database and live connection status
    @app.route('/api/health', methods=['GET'])
    def health_check():
        is_connected, error_msg = test_database_connection()
        return jsonify({
            'status': 'ONLINE' if is_connected else 'DATABASE_OFFLINE',
            'server': 'Flask-SQLite-SQLAlchemy',
            'system': 'PlacementHub Unified Backend',
            'database': 'sqlite',
            'database_connected': is_connected,
            'database_file': Config.SQLITE_DB_PATH,
            'connection_error': error_msg if not is_connected else None
        }), 200

    # Global Error Handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'success': False, 'error': getattr(e, 'description', 'Bad Request')}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({'success': False, 'error': getattr(e, 'description', 'Unauthorized')}), 401

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({'success': False, 'error': getattr(e, 'description', 'Forbidden')}), 403

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'success': False, 'error': getattr(e, 'description', 'Resource not found')}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"====================================================")
    print(f" PlacementHub Flask API Server listening on port {port}")
    print(f" - Health check: http://localhost:{port}/api/health")
    print(f" - API base:     http://localhost:{port}/api")
    print(f"====================================================")
    app.run(host='0.0.0.0', port=port, debug=False)
