import requests
import json
import sys
import time

# Configuración Base
BASE_URL = "http://localhost/api"

# Credenciales Dinámicas para este test
SUFFIX = int(time.time())
OWNER_EMAIL = f"owner.{SUFFIX}@test.com"
COACH_A_EMAIL = f"coach.a.{SUFFIX}@test.com"
S1_EMAIL = f"s1.{SUFFIX}@test.com"
S2_EMAIL = f"s2.{SUFFIX}@test.com"
S3_EMAIL = f"s3.{SUFFIX}@test.com"
PASSWORD = "Password.123"

class APIClient:
    def __init__(self, label):
        self.label = label
        self.session = requests.Session()
        self.token = None
        self.tenant_id = None
        self.user_id = None

    def log(self, message, level="INFO"):
        colors = {"INFO": "\033[94m", "SUCCESS": "\033[92m", "ERROR": "\033[91m", "END": "\033[0m"}
        print(f"{colors.get(level, '')}[{self.label}] {message}{colors['END']}")

    def request(self, method, path, json_data=None, step_name="Request"):
        url = f"{BASE_URL}{path}"
        resp = self.session.request(method, url, json=json_data)
        if resp.status_code >= 400:
            self.log(f"FAIL: {step_name} ({resp.status_code}) - {resp.text}", "ERROR")
            raise Exception(f"API Error: {resp.status_code}")
        
        data = resp.json()
        if isinstance(data, dict) and "data" in data:
            return data["data"]
        return data

    def login(self, email, password):
        data = self.request("POST", "/auth/login", {"email": email, "password": password}, "Login")
        self.token = self.session.cookies.get('access_token') or data.get('access_token')
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        
        # Profile info
        profile = self.request("GET", "/auth/me", step_name="Get Profile")
        user_info = profile.get('user', profile)
        self.user_id = user_info.get('id') or user_info.get('_id')
        self.tenant_id = profile.get('tenantId') or user_info.get('tenantId')
        
        if not self.tenant_id and profile.get('userRoles'):
            self.tenant_id = profile['userRoles'][0]['tenantId']
            
        self.session.headers.update({"x-tenant-id": str(self.tenant_id)})
        self.log(f"Login exitoso (ID: {self.user_id}, Tenant: {self.tenant_id})", "SUCCESS")

    def register(self, email, password, role="mentor_owner", tenant_id=None):
        payload = {
            "email": email, "password": password, 
            "firstName": self.label, "lastName": "Test",
            "mentorName": f"Org {self.label}", "role": role
        }
        if tenant_id: payload["tenantId"] = tenant_id
        return self.request("POST", "/auth/register", payload, f"Register {role}")

def main():
    owner = APIClient("OWNER")
    coach_a = APIClient("COACH_A")
    s1 = APIClient("S1")
    s2 = APIClient("S2")
    s3 = APIClient("S3")
    students = [s1, s2, s3]

    try:
        print("\n🏢 INICIANDO TEST ENTERPRISE: 1 OWNER, 1 COACH, 3 ESTUDIANTES\n" + "="*65)

        # 1. Registro de Owner
        owner.register(OWNER_EMAIL, PASSWORD, role="mentor_owner")
        owner.login(OWNER_EMAIL, PASSWORD)

        # 2. Registro de Coach A vinculado al Tenant del Owner
        print(f"\n[INFO] Registrando Coach A para el Tenant {owner.tenant_id}...")
        owner.register(COACH_A_EMAIL, PASSWORD, role="facilitator", tenant_id=owner.tenant_id)
        coach_a.login(COACH_A_EMAIL, PASSWORD)

        # 3. Owner crea estructura
        print("\n[INFO] Owner creando Programa y Grupo...")
        prog = owner.request("POST", "/mentor/programs", {"name": "Bootcamp Enterprise"}, "Create Program")
        group = owner.request("POST", "/mentor/groups", {"name": "Cohorte Alpha", "programId": prog['id']}, "Create Group")

        # 4. DELEGACIÓN: Owner asigna el Programa y Grupo al Coach A
        print(f"\n[INFO] DELEGACIÓN: Asignando Coach A ({coach_a.user_id}) al Programa y Grupo...")
        owner.request("POST", f"/mentor/programs/{prog['id']}/coach", {"coachId": coach_a.user_id}, "Assign Program Coach")
        owner.request("POST", f"/mentor/groups/{group['id']}/coach", {"coachId": coach_a.user_id}, "Assign Group Coach")

        # 5. Invitación para el Grupo
        inv = owner.request("POST", "/mentor/invitations", {"type": "GROUP", "groupId": group['id']}, "Create Invitation")
        token = inv['token']
        print(f"[SUCCESS] Link de invitación generado: {token}")

        # 6. Onboarding de los 3 Estudiantes
        print("\n[INFO] Onboarding de 3 Estudiantes vía Invitación...")
        for i, s in enumerate(students):
            email = [S1_EMAIL, S2_EMAIL, S3_EMAIL][i]
            s.register(email, PASSWORD, role="mentee", tenant_id=owner.tenant_id)
            s.login(email, PASSWORD)
            s.request("POST", f"/mentor/invitations/accept/{token}", {"menteeId": s.user_id}, f"Accept Invitation Student {i+1}")

        # 7. ASIGNACIÓN MASIVA (BULK OPERATIONS)
        print("\n[INFO] Coach A asigna tarea grupal al Grupo Alpha...")
        bulk_task = coach_a.request("POST", "/mentor/tasks", {
            "groupId": group['id'],
            "title": "Misión 1: Configuración Masiva", 
            "xpReward": 100
        }, "Bulk Task Creation")
        
        # Extraer IDs de las tareas creadas (vienen en 'tasks' del response si es bulk)
        task_ids = [t['id'] for t in bulk_task['tasks']]
        print(f"[SUCCESS] {len(task_ids)} tareas individuales creadas vía Bulk Ops.")

        print(f"[INFO] Coach A asigna hábito grupal al Grupo Alpha...")
        coach_a.request("POST", "/mentor/habits", {
            "groupId": group['id'],
            "name": "Lectura Diaria Masiva",
            "frequency": "DAILY"
        }, "Bulk Habit Creation")

        # 8. FLUJOS DE INTERACCIÓN (HABITOS Y SESIONES)
        print("\n" + "="*20 + " FLUJOS DE INTERACCIÓN " + "="*20)
        
        # S1 crea un hábito y hace check-in
        print(f"[INFO] {s1.label} crea un hábito de 'Lectura'...")
        h1 = s1.request("POST", "/mentor/habits", {"name": "Lectura Diaria", "frequency": "DAILY"}, "Create Habit")
        s1.request("POST", f"/mentor/habits/{h1['id']}/checkin", {}, "Check-in Habit")

        # Coach A crea una Sesión Grupal
        print(f"[INFO] Coach A agenda Sesión Grupal para el {group['name']}...")
        sess = coach_a.request("POST", "/mentor/sessions", {
            "title": "Kickoff Live", 
            "type": "GROUP", 
            "groupId": group['id'],
            "scheduledAt": "2026-06-01T10:00:00Z"
        }, "Create Session")

        # Coach A registra asistencia (S1, S2 presentes)...
        print("[INFO] Coach A registra asistencia (S1, S2 presentes)...")
        coach_a.request("POST", f"/mentor/sessions/{sess['id']}/attendance", {
            "attendees": [
                {"menteeId": s1.user_id, "status": "ATTENDED"},
                {"menteeId": s2.user_id, "status": "ATTENDED"},
                {"menteeId": s3.user_id, "status": "ABSENT"}
            ]
        }, "Register Attendance")

        # Coach A guarda notas de la sesión
        print("[INFO] Coach A guarda notas de la sesión...")
        coach_a.request("PATCH", f"/mentor/sessions/{sess['id']}/notes", {
            "notes": "Excelente participación de S1. S3 no asistió.",
            "isPrivate": False
        }, "Update Session Notes")

        # S1 deja feedback de la sesión
        print(f"[INFO] {s1.label} deja feedback de la sesión...")
        s1.request("POST", f"/mentor/sessions/{sess['id']}/feedback", {
            "rating": 5,
            "comment": "¡Excelente sesión de Kickoff!"
        }, "Add Session Feedback")

        # 9. FLUJO DE TAREAS (COMPLETAR Y APROBAR)
        print("\n" + "="*20 + " FLUJO DE TAREAS " + "="*20)
        
        # S1 completa su tarea
        print(f"[INFO] {s1.label} sube evidencia de tarea...")
        s1.request("PUT", f"/mentor/tasks/{task_ids[0]}/status", {"status": "SUBMITTED"}, "Submit Task")

        # Coach A aprueba la tarea de S1
        print(f"[INFO] Coach A aprueba tarea de {s1.label}...")
        coach_a.request("PUT", f"/mentor/tasks/{task_ids[0]}/status", {"status": "APPROVED"}, "Approve Task")

        # 10. HITOS (MILESTONES)
        print("\n" + "="*20 + " HITOS Y PROGRESO " + "="*20)
        
        # Coach A crea un Milestone para el programa
        print("[INFO] Coach A crea un Milestone para el Programa...")
        ms = coach_a.request("POST", "/mentor/progress/milestones", {
            "programId": prog['id'],
            "title": "Módulo 1: Fundamentos",
            "description": "Completar todas las tareas iniciales",
            "xpReward": 500
        }, "Create Milestone")

        # Coach A marca el Milestone como completado para S1
        print(f"[INFO] Coach A marca Milestone como completado para {s1.label}...")
        coach_a.request("POST", f"/mentor/progress/milestones/{ms['id']}/complete", {
            "menteeId": s1.user_id
        }, "Complete Milestone")

        # 11. VERIFICACIÓN DE ANALYTICS Y TIMELINE
        print("\n" + "="*20 + " ANALYTICS Y TIMELINE " + "="*20)
        
        # S1 consulta su Timeline
        print(f"[INFO] {s1.label} consulta su Timeline...")
        timeline = s1.request("GET", f"/mentor/progress/timeline/{s1.user_id}", step_name="Get Timeline")
        print(f"[S1 VIEW] Eventos en el Timeline: {len(timeline)}")
        for event in timeline[:3]: # Ver los 3 más recientes
            print(f"  - [{event['type']}] {event['title']}: {event['description']}")

        # S1 consulta su Progress Score
        print(f"[INFO] {s1.label} consulta su Progress Score...")
        score = s1.request("GET", f"/mentor/progress/score/{s1.user_id}", step_name="Get Progress Score")
        print(f"[S1 VIEW] Progress Score: {score['score']}%")
        print(f"  - Tareas: {score['breakdown']['tasks']['percentage']}%")
        print(f"  - Sesiones: {score['breakdown']['sessions']['percentage']}%")

        # 12. VERIFICACIÓN DE DASHBOARDS FINALES
        print("\n" + "="*20 + " VERIFICACIÓN DE DASHBOARDS FINALES " + "="*20)
        
        # Dashboard S1 -> Debería tener XP por: Check-in Habit (10), Asistencia (30), Tarea Aprobada (100) = 140 XP
        s1_dash = s1.request("GET", "/mentor/dashboards/student", step_name="S1 Dashboard")
        print(f"[S1 VIEW] Mi Nivel/XP: {s1_dash['profile'].get('totalXp', 0)} XP")
        print(f"[S1 VIEW] Tareas Pendientes: {s1_dash['pendingTasksCount']}")

        # Dashboard S2 -> Solo Asistencia (30) = 30 XP
        s2_dash = s2.request("GET", "/mentor/dashboards/student", step_name="S2 Dashboard")
        print(f"[S2 VIEW] Mi Nivel/XP: {s2_dash['profile'].get('totalXp', 0)} XP")

        # Dashboard Coach -> Debería ver tareas SUBMITTED (la de S2 que no aprobamos)
        # (Vamos a hacer que S2 suba pero no aprobamos)
        s2.request("PUT", f"/mentor/tasks/{task_ids[1]}/status", {"status": "SUBMITTED"}, "S2 Submit Task")
        
        coach_dash = coach_a.request("GET", "/mentor/dashboards/coach", step_name="Coach Dashboard")
        print(f"[COACH VIEW] Tareas por Revisar: {coach_dash['tasksToReviewCount']}")
        print(f"[COACH VIEW] Próximas Sesiones: {len(coach_dash['upcomingSessions'])}")

        # Dashboard Owner -> Analytics Globales
        owner_dash = owner.request("GET", "/mentor/dashboards/owner", step_name="Owner Dashboard")
        print(f"[OWNER VIEW] Alumnos en la Org: {owner_dash['totalMentees']}")
        print(f"[OWNER VIEW] XP Total Generado en la Org: {owner_dash['totalXpGenerated']} XP")
        print(f"[OWNER VIEW] Coaches Activos: {owner_dash['activeCoachesCount']}")

        print("\n" + "="*65 + "\n✅ BIG FLOW ENTERPRISE COMPLETADO EXITOSAMENTE")

    except Exception as e:
        print(f"\n❌ Error Crítico: {str(e)}")
    finally:
        print("\n🧹 Finalizando test...")

if __name__ == "__main__":
    main()
