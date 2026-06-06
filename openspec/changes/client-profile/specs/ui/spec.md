# UI Specification: Client Profile Redesign

## Purpose
Define the user interface requirements and scenarios for the student/client profile dashboard (`StudentProfilePage`) used by coaches.

## Requirements

### Requirement: Profile Information Display
The UI MUST display the client's public information: name, email, role, and academy.

#### Scenario: Displaying public info successfully
- GIVEN a coach navigates to `/dashboard/clients/6a1ca243476c197f59c2b28e`
- WHEN the contact details are successfully fetched
- THEN the page MUST display the client's name, email `mentee1@example.com`, and academy label

---

### Requirement: Streak Metrics Visualization
The UI MUST display the client's active streak (racha) using a visual Flame widget.

#### Scenario: Displaying streak count
- GIVEN the client has an active streak of 5 days
- WHEN the client profile loads
- THEN the dashboard MUST display a Flame icon with the label "5D" or "5 días de racha"
- AND it SHOULD animate using GSAP to draw attention

---

### Requirement: Action History Timeline
The UI MUST show a chronological list (timeline) of interactions and actions performed with dates.

#### Scenario: Displaying timeline actions
- GIVEN a client has past CRM interactions (e.g. log notes, sessions, template completed)
- WHEN the coach selects the "Historial" tab
- THEN the UI MUST show a vertical timeline with dates and action descriptions
- AND if there are no interactions, the UI MUST display a placeholder "Sin historial registrado"

---

### Requirement: Template Assignment Workflow
The UI MUST enable the coach to assign a template (program) to the client.

#### Scenario: Successful program template assignment
- GIVEN a coach is on the client profile page and clicks the "Asignar Plantilla" button
- WHEN the coach selects a template (e.g., "Hábitos Fitness") and submits the assignment modal
- THEN the client-profile page MUST make a POST request to `/mentor/programs/{templateId}/assign` with `{ studentId: "{id}" }`
- AND display a success toast notification "Plantilla asignada con éxito"

#### Scenario: Template assignment fails due to network error
- GIVEN a coach selects a template and clicks submit
- WHEN the network request fails
- THEN the modal MUST stay open and display an error toast "Error al asignar plantilla"
