import requests
import time
import json

BASE_URL = "http://localhost/api"
# Cambiar por credenciales reales si es necesario, 
# o el script intentará registrar usuarios de prueba
ts = int(time.time())
MENTOR_EMAIL = f"mentor_{ts}@test.com"
STUDENT_EMAIL = f"student_{ts}@test.com"
HACKER_EMAIL = f"hacker_{ts}@test.com"
PASSWORD = "Password123!"

class ResourceTestClient:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
        self.token = None
        self.user_id = None
        self.tenant_id = None

    def log(self, message, level="STEP"):
        prefix = "[🚀]" if level == "STEP" else "[OK]" if level == "SUCCESS" else "[❌]"
        print(f"{prefix} {message}")

    def check_response(self, response, action):
        if response.status_code >= 400:
            self.log(f"Error en {action}: {response.status_code} - {response.text}", "ERROR")
            raise Exception(f"Failed {action}")
        return response.json()

    def register(self, email, role="mentee", tenant_id=None):
        url = f"{self.base_url}/auth/register"
        payload = {
            "email": email,
            "password": PASSWORD,
            "role": role,
            "firstName": "Test",
            "lastName": "User"
        }
        if tenant_id:
            payload["tenantId"] = tenant_id
        
        resp = self.session.post(url, json=payload)
        if resp.status_code == 201:
            data = resp.json()
            self.tenant_id = data.get('tenantId')
            return data
        return None

    def login(self, email):
        url = f"{self.base_url}/auth/login"
        payload = {"email": email, "password": PASSWORD}
        data = self.check_response(self.session.post(url, json=payload), "Login")
        
        # El token viene en una cookie HttpOnly 'access_token'
        token = self.session.cookies.get('access_token')
        if not token:
            # Intentar ver si viene en el body por si acaso (fallback)
            token = data.get('access_token') or data.get('token')
            
        if not token:
            print(f"DEBUG - Login Response: {data}")
            print(f"DEBUG - Cookies: {self.session.cookies.get_dict()}")
            raise Exception("No se pudo encontrar el token de acceso en la respuesta ni en las cookies")

        print(f"DEBUG - DATA: {data}")
        self.token = token
        
        # El interceptor global envuelve todo en 'data'
        user_info = data.get('data', {}).get('user') or data.get('user')
        if not user_info:
            raise Exception(f"No se pudo encontrar la información del usuario en: {data}")

        self.user_id = user_info['id']
        self.tenant_id = user_info['tenantId']
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        return data

    def create_program(self):
        url = f"{self.base_url}/mentor/programs"
        payload = {"name": "Programa de Recursos VIP", "description": "Para probar accesos"}
        return self.check_response(self.session.post(url, json=payload), "Crear Programa")

    def enroll_student(self, program_id, mentee_id):
        url = f"{self.base_url}/mentor/programs/{program_id}/enroll"
        payload = {"menteeId": mentee_id}
        return self.check_response(self.session.post(url, json=payload), "Inscribir Alumno")

    # --- RESOURCE ACTIONS ---
    def create_resource(self, title, type="ARTICLE", is_public=False, program_id=None, phase_id=None):
        url = f"{self.base_url}/mentor/resources"
        payload = {
            "title": title,
            "type": type,
            "isPublic": is_public,
            "category": "TEST",
            "url": "http://storage.gateway/file.pdf"
        }
        if program_id: payload["programId"] = program_id
        if phase_id: payload["phaseId"] = phase_id
        
        return self.check_response(self.session.post(url, json=payload), f"Crear Recurso: {title}")

    def list_all_resources(self):
        url = f"{self.base_url}/mentor/resources"
        return self.check_response(self.session.get(url), "Listar Todo (Coach)")

    def get_my_library(self):
        url = f"{self.base_url}/mentor/resources/me"
        return self.check_response(self.session.get(url), "Listar Mi Biblioteca (Alumno)")

    def get_resource(self, resource_id):
        url = f"{self.base_url}/mentor/resources/{resource_id}"
        resp = self.session.get(url)
        return resp.status_code, resp.json() if resp.status_code < 400 else resp.text

def run_test():
    mentor = ResourceTestClient(BASE_URL)
    student = ResourceTestClient(BASE_URL)
    hacker = ResourceTestClient(BASE_URL)

    try:
        print("\n📚 INICIANDO TEST DE FLUJO DE RECURSOS\n" + "="*50)

        # 1. Setup
        mentor.log("Registrando y logueando Mentor...")
        mentor.register(MENTOR_EMAIL, role="mentor_owner")
        mentor.login(MENTOR_EMAIL)

        mentor.log("Creando Programa...")
        prog = mentor.create_program()
        prog_id = prog['id']

        # 2. Crear Recursos
        mentor.log("Creando Recursos con distintos niveles de acceso...")
        res_public = mentor.create_resource("Reglamento General", is_public=True)
        res_vip = mentor.create_resource("Manual Secreto VIP", is_public=False, program_id=prog_id)
        
        res_public_id = res_public['id']
        res_vip_id = res_vip['id']

        # 3. Test Alumno con acceso (Inscrito)
        mentor.log("Configurando Alumno Inscrito...")
        student.register(STUDENT_EMAIL, tenant_id=mentor.tenant_id)
        student.login(STUDENT_EMAIL)
        mentor.enroll_student(prog_id, student.user_id)

        student.log("Alumno verifica su biblioteca...")
        lib = student.get_my_library()
        titles = [r['title'] for r in lib]
        print(f"[INFO] Recursos en biblioteca: {titles}")
        
        if "Reglamento General" in titles and "Manual Secreto VIP" in titles:
            student.log("Alumno tiene acceso a lo público Y a su programa.", "SUCCESS")
        else:
            raise Exception("Alumno no ve los recursos que debería")

        # 4. Test Alumno SIN acceso (Hacker)
        mentor.log("Configurando Alumno SIN acceso (Hacker)...")
        hacker.register(HACKER_EMAIL, tenant_id=mentor.tenant_id)
        hacker.login(HACKER_EMAIL)

        hacker.log("Hacker intenta ver su biblioteca...")
        h_lib = hacker.get_my_library()
        h_titles = [r['title'] for r in h_lib]
        print(f"[INFO] Recursos hacker: {h_titles}")
        
        if "Manual Secreto VIP" not in h_titles:
            hacker.log("Hacker NO ve el recurso VIP en su lista.", "SUCCESS")
        
        hacker.log(f"Hacker intenta acceder directamente al recurso VIP: {res_vip_id}")
        code, detail = hacker.get_resource(res_vip_id)
        if code == 404 or code == 403:
            hacker.log(f"Sistema rebotó al hacker exitosamente (Código: {code}).", "SUCCESS")
        else:
            hacker.log(f"FALLO: Hacker pudo acceder al recurso VIP. Código: {code}", "ERROR")
            raise Exception("Falla de seguridad: Acceso no autorizado")

        print("\n" + "="*50 + "\n✅ TEST DE RECURSOS COMPLETADO EXITOSAMENTE")

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
    finally:
        print("\n🧹 Fin del test.")

if __name__ == "__main__":
    run_test()
