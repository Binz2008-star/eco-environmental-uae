import tempfile, unittest, sqlite3
from pathlib import Path
from app import create_app
class AppTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory(); self.path=str(Path(self.tmp.name)/'test.db')
  self.config=dict(TESTING=True,SECRET_KEY='s'*40,ADMIN_PASSWORD='p'*24,DATABASE=self.path)
  self.client=create_app(self.config).test_client(); self.client.get('/')
  with self.client.session_transaction() as s: self.csrf=s['csrf']
  self.data=dict(csrf=self.csrf,name='Test customer',phone='0501234567',location='Dubai test site',kind='خشب',pickup_date='2099-01-01',notes='<script>alert(1)</script>',consent='yes')
 def tearDown(self): self.tmp.cleanup()
 def create(self):
  r=self.client.post('/',data=self.data); self.assertEqual(r.status_code,303); return r.headers['Location']
 def login(self):
  self.client.post('/admin/login',data=dict(csrf=self.csrf,password='p'*24)); self.client.get('/admin')
  with self.client.session_transaction() as s: self.csrf=s['csrf']
 def test_persistence_and_tracking_privacy(self):
  link=self.create(); other=create_app(self.config).test_client(); body=other.get(link).text
  self.assertIn('تم استلام طلبك',body); self.assertNotIn('0501234567',body); self.assertNotIn('Test customer',body)
  self.assertEqual(other.get('/track/unknown').status_code,404)
 def test_csrf_and_admin_protection(self):
  self.assertEqual(self.client.post('/',data={}).status_code,400)
  self.assertEqual(self.client.get('/admin').status_code,302)
  self.assertEqual(self.client.post('/admin/requests/1/status',data=dict(csrf=self.csrf,status='reviewing')).status_code,403)
 def test_validation(self):
  for field,value in [('phone','123'),('pickup_date','2000-01-01'),('kind','hazardous'),('consent',''),('name',''),('notes','x'*1001)]:
   data=dict(self.data); data[field]=value
   r=self.client.post('/',data=data); self.assertEqual(r.status_code,200); self.assertIn('تحقق من الحقول',r.text)
  with sqlite3.connect(self.path) as c: self.assertEqual(c.execute('SELECT count(*) FROM requests').fetchone()[0],0)
 def test_state_machine_audit_and_escaping(self):
  self.create(); self.login(); body=self.client.get('/admin').text
  self.assertIn('&lt;script&gt;',body); self.assertNotIn('<script>',body)
  endpoint='/admin/requests/1/status'
  self.assertEqual(self.client.post(endpoint,data=dict(csrf=self.csrf,status='completed')).status_code,400)
  for status in ['reviewing','quoted','scheduled','completed']:
   self.assertEqual(self.client.post(endpoint,data=dict(csrf=self.csrf,status=status)).status_code,303)
  with sqlite3.connect(self.path) as c: self.assertEqual(c.execute('SELECT count(*) FROM events').fetchone()[0],4)
  self.assertEqual(self.client.post(endpoint,data=dict(csrf=self.csrf,status='new')).status_code,400)
 def test_login_logout_headers(self):
  self.client.post('/admin/login',data=dict(csrf=self.csrf,password='wrong')); self.assertEqual(self.client.get('/admin').status_code,302)
  self.login(); self.assertEqual(self.client.get('/admin').status_code,200)
  self.client.post('/admin/logout',data=dict(csrf=self.csrf)); self.assertEqual(self.client.get('/admin').status_code,302)
  self.assertEqual(self.client.get('/').headers['Referrer-Policy'],'no-referrer')
 def test_secrets_required(self):
  with self.assertRaises(RuntimeError): create_app(dict(self.config,SECRET_KEY='short'))
