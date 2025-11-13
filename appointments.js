// Appointment Management System using localStorage

// Initialize appointments
function initAppointments() {
    if (!localStorage.getItem('appointments')) {
        localStorage.setItem('appointments', JSON.stringify([]));
    }
}

// Get all appointments
function getAppointments() {
    const appointments = localStorage.getItem('appointments');
    return appointments ? JSON.parse(appointments) : [];
}

// Save appointments
function saveAppointments(appointments) {
    localStorage.setItem('appointments', JSON.stringify(appointments));
}

// Add appointment
function addAppointment(appointmentData) {
    const appointments = getAppointments();
    const newAppointment = {
        id: Date.now(),
        ...appointmentData,
        createdAt: new Date().toISOString(),
        status: 'scheduled'
    };
    
    appointments.push(newAppointment);
    saveAppointments(appointments);
    
    // Also add to patient's appointments array
    const patients = JSON.parse(localStorage.getItem('patients') || '[]');
    const patientIndex = patients.findIndex(p => p.id == appointmentData.patientId);
    if (patientIndex !== -1) {
        if (!patients[patientIndex].appointments) {
            patients[patientIndex].appointments = [];
        }
        patients[patientIndex].appointments.push(newAppointment.id);
        localStorage.setItem('patients', JSON.stringify(patients));
    }
    
    return { success: true, message: 'Appointment scheduled successfully!' };
}

// Update appointment
function updateAppointment(appointmentId, updatedData) {
    const appointments = getAppointments();
    const index = appointments.findIndex(a => a.id == appointmentId);
    
    if (index === -1) {
        return { success: false, message: 'Appointment not found' };
    }
    
    appointments[index] = { ...appointments[index], ...updatedData };
    saveAppointments(appointments);
    
    return { success: true, message: 'Appointment updated successfully!' };
}

// Delete appointment
function deleteAppointment(appointmentId) {
    const appointments = getAppointments();
    const filtered = appointments.filter(a => a.id != appointmentId);
    saveAppointments(filtered);
    return { success: true, message: 'Appointment deleted successfully!' };
}

// Get appointments by patient ID
function getAppointmentsByPatient(patientId) {
    const appointments = getAppointments();
    return appointments.filter(a => a.patientId == patientId);
}

// Initialize on load
initAppointments();

