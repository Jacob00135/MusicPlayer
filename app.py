import os
import sqlite3
from config import create_app

# 创建应用
app = create_app()


@app.shell_context_processor
def make_shell_context():
    db = sqlite3.connect(
        app.config['DATABASE_PATH'],
        detect_types=sqlite3.PARSE_DECLTYPES
    )
    db.row_factory = sqlite3.Row

    return dict(
        db=db,
    )
