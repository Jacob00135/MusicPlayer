import os
import sqlite3
from flask import Flask, g, current_app

root_path = os.path.dirname(os.path.realpath(__file__))
database_path = os.path.join(root_path, 'database')
if not os.path.exists(database_path):
    os.mkdir(database_path)


class Config(object):
    # Flask app初始化时所必须的密钥
    SECRET_KEY = os.urandom(16)

    # 数据库配置
    DATABASE_PATH = os.path.join(database_path, 'db.sqlite')


def init_database():
    """
    # 连接数据库，同时也能在数据库不存在时创建数据库
    con = sqlite3.connect(Config.DATABASE_PATH)
    cursor = con.cursor()
    # 关闭连接
    cursor.close()
    con.close()
    """


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE_PATH'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row

    return g.db


def close_db(exception_message=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()



def create_app():
    # 创建环境
    app = Flask(__name__)
    app.config.from_object(Config)

    # 初始化数据库
    init_database()

    # 让每一次请求结束后，关闭与数据库的连接
    app.teardown_appcontext(close_db)

    # 注册蓝图
    from main_views import main_blueprint
    app.register_blueprint(main_blueprint)

    # 往JinJa模板环境中注入变量

    return app
