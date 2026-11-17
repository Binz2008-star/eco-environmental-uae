import os
import secrets
import sqlite3
import hmac
from datetime import datetime, date
from zoneinfo import ZoneInfo
from pathlib import Path
from flask import Flask, request, session, render_template, redirect, url_for, abort

STATUSES = ('new', 'reviewing', 'quoted', 'scheduled', 'completed', 'cancelled')
LABELS = dict(zip(STATUSES, ('جديد', 'قيد المراجعة', 'تم التسعير', 'تمت الجدولة', 'مكتمل', 'ملغي')))
TRANSITIONS = {'new': ('reviewing', 'cancelled'), 'reviewing': ('quoted', 'cancelled'), 'quoted': ('scheduled', 'reviewing', 'cancelled'), 'scheduled': ('completed', 'cancelled'), 'completed': (), 'cancelled': ()}
KINDS = ('مخلفات ترميم غير خطرة', 'خشب', 'معادن', 'مخلفات مختلطة غير خطرة')

def create_app(config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(SECRET_KEY=os.environ.get('SECRET_KEY'), ADMIN_PASSWORD=os.environ.get('ADMIN_PASSWORD'), DATABASE=str(Path(app.instance_path) / 'eco.sqlite3'), MAX_CONTENT_LENGTH=16384, SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE='Strict', SESSION_COOKIE_SECURE=os.environ.get('COOKIE_SECURE') == '1')
    if config:
        app.config.update(config)
    if not app.config['SECRET_KEY'] or len(app.config['SECRET_KEY']) < 32 or not app.config['ADMIN_PASSWORD'] or len(app.config['ADMIN_PASSWORD']) < 16:
        raise RuntimeError('Set SECRET_KEY (32+ characters) and ADMIN_PASSWORD (16+ characters).')
    Path(app.config['DATABASE']).parent.mkdir(parents=True, exist_ok=True)

    def db():
        conn = sqlite3.connect(app.config['DATABASE'])
        conn.row_factory = sqlite3.Row
        return conn

    with db() as conn:
        conn.executescript('''CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY, token TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
        phone TEXT NOT NULL, location TEXT NOT NULL, kind TEXT NOT NULL,
        pickup_date TEXT NOT NULL, notes TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new',
        created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY, request_id INTEGER NOT NULL,
        old_status TEXT NOT NULL, new_status TEXT NOT NULL, created_at TEXT NOT NULL);''')

    @app.context_processor
    def context():
        if 'csrf' not in session:
            session['csrf'] = secrets.token_urlsafe(32)
        return dict(csrf=session['csrf'], labels=LABELS, kinds=KINDS, transitions=TRANSITIONS)

    @app.before_request
    def csrf_check():
        if request.method == 'POST' and not hmac.compare_digest(session.get('csrf', ''), request.form.get('csrf', '')):
            abort(400)
        if request.method == 'POST' and not session.get('csrf'):
            abort(400)

    @app.after_request
    def headers(response):
        response.headers['Cache-Control'] = 'no-store'
        response.headers['Referrer-Policy'] = 'no-referrer'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['Content-Security-Policy'] = "default-src 'self'; style-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'"
        return response

    @app.get('/health')
    def health():
        with db() as conn:
            conn.execute('SELECT 1')
        return {'status': 'ok'}

    @app.route('/', methods=['GET', 'POST'])
    def index():
        error = None
        if request.method == 'POST':
            data = {k: request.form.get(k, '').strip() for k in ('name', 'phone', 'location', 'kind', 'pickup_date', 'notes')}
            import re
            try:
                day = date.fromisoformat(data['pickup_date'])
                valid = day >= datetime.now(ZoneInfo('Asia/Dubai')).date()
            except ValueError:
                valid = False
            valid = valid and 2 <= len(data['name']) <= 100 and 5 <= len(data['location']) <= 300 and len(data['notes']) <= 1000 and data['kind'] in KINDS and re.fullmatch(r'(?:\+971|0)5[0-9]{8}', data['phone']) and request.form.get('consent') == 'yes'
            if valid:
                token = secrets.token_urlsafe(32)
                with db() as conn:
                    conn.execute('INSERT INTO requests(token,name,phone,location,kind,pickup_date,notes,created_at) VALUES(?,?,?,?,?,?,?,?)', (token, *data.values(), datetime.now(ZoneInfo('Asia/Dubai')).isoformat()))
                return redirect(url_for('track', token=token), code=303)
            error = 'تحقق من الحقول، رقم الهاتف الإماراتي والتاريخ والموافقة.'
        return render_template('index.html', error=error)

    @app.get('/track/<token>')
    def track(token):
        with db() as conn:
            item = conn.execute('SELECT status, pickup_date FROM requests WHERE token=?', (token,)).fetchone()
        if item is None:
            abort(404)
        return render_template('track.html', item=item)

    @app.route('/admin/login', methods=['GET', 'POST'])
    def login():
        error = None
        if request.method == 'POST':
            if hmac.compare_digest(request.form.get('password', ''), app.config['ADMIN_PASSWORD']):
                session.clear()
                session['admin'] = True
                return redirect(url_for('admin'), code=303)
            error = 'بيانات الدخول غير صحيحة.'
        return render_template('login.html', error=error)

    @app.get('/admin')
    def admin():
        if not session.get('admin'):
            return redirect(url_for('login'))
        with db() as conn:
            items = conn.execute('SELECT * FROM requests ORDER BY id DESC LIMIT 100').fetchall()
        return render_template('admin.html', items=items)

    @app.post('/admin/requests/<int:item_id>/status')
    def update_status(item_id):
        if not session.get('admin'):
            abort(403)
        new = request.form.get('status')
        with db() as conn:
            conn.execute('BEGIN IMMEDIATE')
            item = conn.execute('SELECT status FROM requests WHERE id=?', (item_id,)).fetchone()
            if item is None:
                abort(404)
            if new not in TRANSITIONS[item['status']]:
                abort(400)
            conn.execute('UPDATE requests SET status=? WHERE id=?', (new, item_id))
            conn.execute('INSERT INTO events(request_id,old_status,new_status,created_at) VALUES(?,?,?,?)', (item_id, item['status'], new, datetime.now(ZoneInfo('Asia/Dubai')).isoformat()))
        return redirect(url_for('admin'), code=303)

    @app.post('/admin/logout')
    def logout():
        session.clear()
        return redirect(url_for('index'), code=303)

    return app
