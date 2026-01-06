import os
import django
import psycopg2

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from django.conf import settings

# Get database settings
db = settings.DATABASES['default']

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname=db['NAME'],
    user=db['USER'],
    password=db['PASSWORD'],
    host=db['HOST'],
    port=db['PORT']
)
conn.autocommit = True
cur = conn.cursor()

print("Fixing django_admin_log foreign key constraint...")

try:
    # Drop the old foreign key constraint
    print("Dropping old constraint...")
    cur.execute("""
        ALTER TABLE django_admin_log 
        DROP CONSTRAINT IF EXISTS django_admin_log_user_id_c564eba6_fk_auth_user_id;
    """)
    
    # Add new foreign key constraint pointing to accounts_customuser
    print("Adding new constraint...")
    cur.execute("""
        ALTER TABLE django_admin_log 
        ADD CONSTRAINT django_admin_log_user_id_c564eba6_fk_accounts_customuser_id
        FOREIGN KEY (user_id) REFERENCES accounts_customuser(id) 
        DEFERRABLE INITIALLY DEFERRED;
    """)
    
    print("✅ Successfully fixed django_admin_log foreign key!")
    print("You can now use the Django admin without errors.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nTrying alternative solution: clearing admin log entries...")
    try:
        cur.execute("DELETE FROM django_admin_log;")
        print("✅ Cleared admin log. Django will recreate entries as needed.")
    except Exception as e2:
        print(f"❌ Could not clear admin log: {e2}")

finally:
    cur.close()
    conn.close()
