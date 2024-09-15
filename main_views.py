import os
from flask import (
    Blueprint, render_template, request, url_for, jsonify,
    send_from_directory, current_app, session
)
from config import get_db, Config

main_blueprint = Blueprint('main', __name__)


@main_blueprint.app_errorhandler(404)
def page_not_found(e):
    status_code = 404
    response = render_template(
        'error.html',
        status_code=status_code,
        error_info='页面不存在'
    )
    return response, status_code


@main_blueprint.app_errorhandler(403)
def forbidden(e):
    status_code = 403
    response = render_template(
        'error.html',
        status_code=status_code,
        error_info='无权访问'
    )
    return response, status_code


@main_blueprint.app_errorhandler(500)
def internal_server_error(e):
    status_code = 500
    response = render_template(
        'error.html',
        status_code=status_code,
        error_info='服务器内部错误'
    )
    return response, status_code


@main_blueprint.app_errorhandler(405)
def method_not_allowed(e):
    status_code = 405
    response = render_template(
        'error.html',
        status_code=status_code,
        error_info='不允许的请求方法'
    )
    return response, status_code


@main_blueprint.route('/')
def index():
    return render_template('index.html')


@main_blueprint.route('/player')
def player():
    playlist = session.get('current_playlist', [])
    filenames = [os.path.basename(fp) for fp in playlist]
    return render_template(
        'player.html',
        playlist=playlist,
        filenames=filenames
    )


@main_blueprint.route('/open_file', methods=['POST'])
def open_file():
    playlist = request.json.get('playlist', [])
    session['current_playlist'] = playlist
    return jsonify({'status': 1, 'message': 'success'})


@main_blueprint.route('/get_current_playlist')
def get_current_playlist():
    current_playlist = session.get('current_playlist', [])
    return jsonify({'status': 1, 'data': current_playlist})


@main_blueprint.route('/storage/<path:filepath>')
def get_storage_file(filepath):
    filepath = os.path.realpath(os.path.join(Config.FLASK_FILE_ROOT_PATH, filepath))
    directory_path, filename = os.path.split(filepath)
    return send_from_directory(directory_path, filename, as_attachment=False)
