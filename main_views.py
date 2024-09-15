import os
import json
from flask import (
    Blueprint, render_template, request, url_for, jsonify,
    send_from_directory, current_app, session, redirect
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
    db = get_db()
    playlist_name_list = db.execute('SELECT `playlist_name` FROM `playlist`;').fetchall()
    playlist_name_list = [obj['playlist_name'] for obj in playlist_name_list]

    return render_template('index.html', playlist_name_list=playlist_name_list)


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


@main_blueprint.route('/save_playlist')
def save_playlist():
    playlist_name = request.args.get('playlist-name')
    if playlist_name is None:
        return jsonify({'status': 0, 'message': '播放列表名称不能为空'})
    current_playlist = session.get('current_playlist', [])
    if not current_playlist:
        return jsonify({'status': 0, 'message': '播放列表为空，不能保存'})

    db = get_db()
    record = db.execute(
        'SELECT `playlist_name` FROM `playlist` WHERE `playlist_name` == ?;',
        (playlist_name, )
    ).fetchone()
    if record is not None:
        return jsonify({'status': 0, 'message': '播放列表名称已存在'})

    playlist_content = json.dumps(current_playlist)

    try:
        db.execute(
            'INSERT INTO `playlist`(`playlist_name`, `playlist_content`) VALUES(?, ?)',
            (playlist_name, playlist_content)
        )
        db.commit()
    except Exception as e:
        return jsonify({'status': 0, 'message': '数据库错误：{}'.format(e.args[0])})

    return jsonify({'status': 1, 'message': '保存成功'})


@main_blueprint.route('/load_saved_playlist')
def load_saved_playlist():
    playlist_name = request.args.get('playlist_name')
    if playlist_name is None:
        return redirect(url_for('main.player'))

    db = get_db()
    record = db.execute(
        'SELECT playlist_content FROM playlist WHERE playlist_name=?;',
        (playlist_name, )
    ).fetchone()
    if record is None:
        return redirect(url_for('main.player'))

    session['current_playlist'] = json.loads(record['playlist_content'])

    return redirect(url_for('main.player'))


@main_blueprint.route('/delete_playlist')
def delete_playlist():
    playlist_name = request.args.get('playlist_name')
    if playlist_name is None:
        return jsonify({'status': 0, 'message': 'playlist_name参数不能为空'})

    db = get_db()
    record = db.execute(
        'SELECT playlist_name FROM playlist WHERE playlist_name=?',
        (playlist_name, )
    ).fetchone()
    if record is None:
        return jsonify({'status': 0, 'message': '播放列表不存在'})

    db.execute(
        'DELETE FROM playlist WHERE playlist_name=?',
        (playlist_name, )
    )
    db.commit()

    return jsonify({'status': 1, 'message': '删除成功'})


@main_blueprint.route('/storage/<path:filepath>')
def get_storage_file(filepath):
    filepath = os.path.realpath(os.path.join(Config.FLASK_FILE_ROOT_PATH, filepath))
    directory_path, filename = os.path.split(filepath)
    return send_from_directory(directory_path, filename, as_attachment=False)
