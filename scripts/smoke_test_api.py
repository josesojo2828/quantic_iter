import requests
import json
import sys
import time

# Configuración Base
BASE_URL = "http://localhost/api"
MENTOR_EMAIL = "josesojo2828@gmail.com"
MENTOR_PASSWORD = "abc.12345"

# Generaremos estudiantes dinámicos
STUDENT_EMAIL = f"student.test.{int(time.time())}@gmail.com"
INVITED_STUDENT_EMAIL = f"invited.test.{int(time.time())}@gmail.com"
STUDENT_PASSWORD = "Password.123"

class APIClient:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
        self.token = None
        self.tenant_id = None
        self.user_id = None
        self.created_resources = {
            "contacts": [],
            "groups": [],
            "programs": [],
            "tasks": [],
            "habits": [],
            "users": [],
            "invitations": []
        }

    def log(self, message, level="INFO", elapsed=None):
        colors = {
            "INFO": "\033[94m",
            "SUCCESS": "\033[92m",
            "WARNING": "\033[93m",
            "ERROR": "\033[91m",
            "METRIC": "\033[95m",
            "END": "\033[0m"
        }
        time_str = f" [{elapsed:.2f}s]" if elapsed is not None else ""
        print(f"{colors.get(level, '')}[{level}]{time_str} {message}{colors['END']}")

    def check_response(self, response, step_name, expected_type=None):
        elapsed = response.elapsed.total_seconds()
        method = response.request.method
        url_path = response.request.url.replace(self.base_url, "")
        
        if response.status_code >= 400:
            self.log(f"Fallo en: {step_name} ({method} {url_path})", "ERROR", elapsed)
            self.log(f"Status Code: {response.status_code}", "ERROR")
            self.log(f"Response: {response.text}", "ERROR")
            raise Exception(f"API Error in {step_name}: {response.status_code}")
        
        if expected_type == str:
            self.log(f"{step_name} ({method} {url_path})", "SUCCESS", elapsed)
            return response.text

        try:
            json_data = response.json()
        except Exception:
            self.log(f"Error parseando JSON en {step_name}", "ERROR", elapsed)
            sys.exit(1)

        self.log(f"{step_name} ({method} {url_path})", "SUCCESS", elapsed)
        
        if isinstance(json_data, dict) and "data" in json_data:
            return json_data["data"]
            
        return json_data

    def login(self, email, password):
        self.log(f"Intentando login con {email}...")
        url = f"{self.base_url}/auth/login"
        payload = {"email": email, "password": password}
        response = self.session.post(url, json=payload)
        
        data = self.check_response(response, f"Login de {email}")
        
        self.token = self.session.cookies.get('access_token')
        if not self.token:
            self.token = data.get('access_token')

        if not self.token:
            self.log("No se pudo obtener el token de acceso", "ERROR")
            sys.exit(1)
        
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        self.log("Login exitoso", "INFO")
        
        # Obtener perfil para setear tenant_id
        profile = self.get_profile()
        return profile

    def register_student(self, email, password, tenant_id=None, role="mentor_owner"):
        self.log(f"Registrando usuario {email}...")
        url = f"{self.base_url}/auth/register"
        payload = {
            "email": email,
            "password": password,
            "firstName": "User",
            "lastName": "Test",
            "mentorName": "Empresa Test",
            "role": role
        }
        if tenant_id:
            payload["tenantId"] = tenant_id
            
        data = self.check_response(self.session.post(url, json=payload), f"Registro de {role}")
        return data

    def get_profile(self):
        url = f"{self.base_url}/auth/me"
        data = self.check_response(self.session.get(url), "Obtener Perfil")
        
        user_info = data.get('user', data)
        self.user_id = user_info.get('id') or user_info.get('_id')
        self.tenant_id = data.get('tenantId') or data.get('primaryTenantId') or user_info.get('tenantId')
        
        if not self.tenant_id:
            roles = data.get('userRoles', []) or user_info.get('userRoles', [])
            if roles:
                self.tenant_id = roles[0].get('tenantId')
        
        self.session.headers.update({"x-tenant-id": str(self.tenant_id)})
        return data

    # --- MENTOR ACTIONS ---
    def create_program(self):
        self.log("Mentor: Creando programa...")
        url = f"{self.base_url}/mentor/programs"
        payload = {
            "name": f"Programa de Alto Rendimiento {int(time.time())}",
            "description": "Validación de flujos de mentoría core",
            "phases": [
                {"name": "Fase 1: Onboarding", "order": 0},
                {"name": "Fase 2: Ejecución", "order": 1}
            ]
        }
        data = self.check_response(self.session.post(url, json=payload), "Creación de Programa")
        if data.get('id'):
            self.created_resources["programs"].append(data['id'])
        return data

    def create_group(self, program_id=None):
        self.log("Mentor: Creando grupo...")
        url = f"{self.base_url}/mentor/groups"
        payload = {
            "name": f"Grupo Élite {int(time.time())}",
            "description": "Grupo vinculado a programa de test",
            "programId": program_id
        }
        data = self.check_response(self.session.post(url, json=payload), "Creación de Grupo")
        if data.get('id'):
            self.created_resources["groups"].append(data['id'])
        return data

    def add_group_member(self, group_id, mentee_id):
        self.log(f"Mentor: Agregando estudiante {mentee_id} al grupo {group_id}...")
        url = f"{self.base_url}/mentor/groups/{group_id}/members"
        payload = {"menteeId": mentee_id}
        data = self.check_response(self.session.post(url, json=payload), "Agregar Miembro al Grupo")
        return data

    def enroll_student_in_program(self, program_id, student_id):
        self.log(f"Mentor: Enroll student {student_id} in program {program_id}...")
        url = f"{self.base_url}/mentor/programs/{program_id}/enroll"
        payload = {"menteeId": student_id}
        data = self.check_response(self.session.post(url, json=payload), "Inscripción en Programa")
        return data

    def create_task(self, student_id, program_id=None):
        self.log(f"Mentor: Asignando tarea a estudiante {student_id}...")
        url = f"{self.base_url}/mentor/tasks"
        payload = {
            "assigneeId": student_id,
            "programId": program_id,
            "title": "Primera Misión: Setup",
            "description": "Configura tu entorno de trabajo y saluda al equipo.",
            "priority": "HIGH",
            "xpReward": 100
        }
        data = self.check_response(self.session.post(url, json=payload), "Asignación de Tarea")
        if data.get('id'):
            self.created_resources["tasks"].append(data['id'])
        return data

    def create_habit(self, student_id):
        self.log(f"Mentor: Asignando hábito a estudiante {student_id}...")
        url = f"{self.base_url}/mentor/habits"
        payload = {
            "assigneeId": student_id,
            "name": "Lectura Diaria",
            "description": "Leer 20 páginas de un libro técnico",
            "frequency": "DAILY"
        }
        data = self.check_response(self.session.post(url, json=payload), "Asignación de Hábito")
        if data.get('id'):
            self.created_resources["habits"].append(data['id'])
        return data

    def create_session(self, title, type="ONE_ON_ONE", mentee_id=None, group_id=None):
        self.log(f"Mentor: Agendando sesión {type} - {title}...")
        url = f"{self.base_url}/mentor/sessions"
        payload = {
            "title": title,
            "type": type,
            "menteeId": mentee_id,
            "groupId": group_id,
            "scheduledAt": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(time.time() + 3600)),
            "duration": 45,
            "meetingUrl": "https://meet.google.com/test-session"
        }
        data = self.check_response(self.session.post(url, json=payload), "Agendar Sesión")
        return data

    def record_attendance(self, session_id, mentee_id, status="PRESENT"):
        self.log(f"Mentor: Registrando asistencia {status} para {mentee_id}...")
        url = f"{self.base_url}/mentor/sessions/{session_id}/attendance"
        payload = {"menteeId": mentee_id, "status": status}
        data = self.check_response(self.session.post(url, json=payload), "Registrar Asistencia")
        return data

    def create_invitation(self, type="PROGRAM", program_id=None, group_id=None, max_uses=0):
        self.log(f"Mentor: Creando link de invitación ({type})...")
        url = f"{self.base_url}/mentor/invitations"
        payload = {
            "type": type,
            "programId": program_id,
            "groupId": group_id,
            "maxUses": max_uses
        }
        data = self.check_response(self.session.post(url, json=payload), "Crear Invitación")
        return data

    # --- PUBLIC/STUDENT ACTIONS ---
    def validate_invitation(self, token):
        self.log(f"Public: Validando token {token}...")
        url = f"{self.base_url}/mentor/invitations/validate/{token}"
        data = self.check_response(self.session.get(url), "Validar Token")
        return data

    def accept_invitation(self, token, mentee_id):
        self.log(f"Public: Aceptando invitación {token} para mentee {mentee_id}...")
        url = f"{self.base_url}/mentor/invitations/accept/{token}"
        payload = {"menteeId": mentee_id}
        data = self.check_response(self.session.post(url, json=payload), "Aceptar Invitación")
        return data

    def get_my_tasks(self, student_id):
        self.log("Estudiante: Consultando mis tareas...")
        url = f"{self.base_url}/mentor/tasks/mentee/{student_id}"
        data = self.check_response(self.session.get(url), "Listar Mis Tareas")
        return data

    def complete_task(self, task_id):
        self.log(f"Estudiante: Completando tarea {task_id}...")
        url = f"{self.base_url}/mentor/tasks/{task_id}/status"
        payload = {"status": "SUBMITTED"}
        data = self.check_response(self.session.put(url, json=payload), "Completar Tarea")
        return data

    def record_habit_checkin(self, habit_id):
        self.log(f"Estudiante: Registrando check-in de hábito {habit_id}...")
        url = f"{self.base_url}/mentor/habits/{habit_id}/checkin"
        payload = {"date": time.strftime('%Y-%m-%dT%H:%M:%SZ')}
        data = self.check_response(self.session.post(url, json=payload), "Check-in Hábito")
        return data

    def get_gamification_stats(self):
        self.log("Estudiante: Consultando stats de gamificación...")
        url = f"{self.base_url}/mentor/gamification/stats"
        data = self.check_response(self.session.get(url), "Stats Gamificación")
        self.log(f"XP actual: {data.get('xp', data.get('totalXp', 0))} | Nivel: {data.get('level', 1)}", "INFO")
        return data

    def get_my_sessions(self, student_id):
        self.log("Estudiante: Consultando mi agenda...")
        url = f"{self.base_url}/mentor/sessions/mentee/{student_id}"
        data = self.check_response(self.session.get(url), "Listar Mis Sesiones")
        return data

    # --- ANUNCIOS ---
    def create_announcement(self, title, content, program_id=None, group_id=None):
        self.log(f"Creando anuncio: {title}...")
        url = f"{self.base_url}/mentor/announcements"
        payload = {
            "title": title,
            "content": content,
            "type": "GENERAL"
        }
        if program_id:
            payload["programId"] = program_id
            payload["type"] = "PROGRAM"
        if group_id:
            payload["groupId"] = group_id
            payload["type"] = "GROUP"
            
        data = self.check_response(self.session.post(url, json=payload), "Crear Anuncio")
        return data

    def get_announcements(self):
        self.log("Consultando anuncios...")
        url = f"{self.base_url}/mentor/announcements"
        data = self.check_response(self.session.get(url), "Listar Anuncios")
        return data

    # --- MEDICIONES ---
    def record_measurement(self, mentee_id, type, value, unit):
        self.log(f"Registrando medición {type}: {value} {unit}...")
        url = f"{self.base_url}/mentor/measurements"
        payload = {
            "menteeId": mentee_id,
            "type": type,
            "value": value,
            "unit": unit,
            "notes": "Medición registrada por test automático"
        }
        data = self.check_response(self.session.post(url, json=payload), "Registrar Medición")
        return data

    def get_measurements(self, mentee_id):
        self.log(f"Consultando mediciones para {mentee_id}...")
        url = f"{self.base_url}/mentor/measurements/mentee/{mentee_id}"
        data = self.check_response(self.session.get(url), "Listar Mediciones")
        return data

def main():
    mentor = APIClient(BASE_URL)
    student = APIClient(BASE_URL)
    invited_student = APIClient(BASE_URL)
    
    try:
        print("\n🚀 INICIANDO SMOKE TEST COMPLETO (MENTOR & ESTUDIANTE)\n" + "="*60)
        
        # --- PRE-REQUISITO: ASEGURAR QUE EL MENTOR EXISTE ---
        print("\n[FASE 0] Preparando Mentor...")
        try:
            mentor.register_student(MENTOR_EMAIL, MENTOR_PASSWORD, None)
            print("Mentor registrado exitosamente.")
        except Exception:
            print("El mentor ya existe o hubo un error en el registro (continuando...)")

        # --- PARTE 1: FLUJO DEL MENTOR ---
        print("\n[FASE 1] Mentor Configura el Entorno")
        mentor.login(MENTOR_EMAIL, MENTOR_PASSWORD)
        
        prog = mentor.create_program()
        prog_id = prog['id']
        group = mentor.create_group(program_id=prog_id)
        group_id = group['id']
        
        # --- PARTE 2: REGISTRO MANUAL ---
        print(f"\n[FASE 2] Registro y Login de Estudiante Manual: {STUDENT_EMAIL}")
        student.register_student(STUDENT_EMAIL, STUDENT_PASSWORD, tenant_id=mentor.tenant_id, role="mentee")
        student.login(STUDENT_EMAIL, STUDENT_PASSWORD)
        student_id = student.user_id
        
        print("\n[FASE 3] Mentor Asigna Contenido Manualmente")
        mentor.enroll_student_in_program(prog_id, student_id)
        mentor.add_group_member(group_id, student_id)
        
        # --- PARTE 3: INVITACIONES (EL PLATO FUERTE) ---
        print("\n[FASE 8] Onboarding Automático vía Invitación")
        # 1. Mentor crea invitación a Programa
        inv = mentor.create_invitation(type="PROGRAM", program_id=prog_id)
        token = inv['token']
        print(f"[INFO] Token generado: {token}")
        
        # 2. El invitado valida el token (público)
        print("\n[INFO] Simulando flujo de invitado...")
        invited_student.validate_invitation(token)
        
        # 3. El invitado se registra (vía auth-tenant normal, vinculando al tenant de la invitación)
        invited_student.register_student(INVITED_STUDENT_EMAIL, STUDENT_PASSWORD, tenant_id=mentor.tenant_id, role="mentee")
        invited_student.login(INVITED_STUDENT_EMAIL, STUDENT_PASSWORD)
        invited_id = invited_student.user_id
        
        # 4. El invitado "acepta" el link para vincularse al programa
        invited_student.accept_invitation(token, invited_id)
        
        # 5. Verificamos que el invitado ya tenga la tarea asignada si el programa tiene tareas automáticas?
        # Por ahora verificamos que el mentor lo vea en sus tareas
        print("\n[INFO] Verificando que el invitado esté en el programa...")
        mentor_tasks = mentor.create_task(invited_id, prog_id)
        if mentor_tasks:
            print("[SUCCESS] El invitado ya es parte del sistema y puede recibir tareas.")

        print("\n" + "="*60 + "\n✅ FLUJOS COMPLETADOS EXITOSAMENTE")

    except Exception as e:
        print(f"\n❌ Error Crítico: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        print("\n🧹 Finalizando test...")

if __name__ == "__main__":
    main()
