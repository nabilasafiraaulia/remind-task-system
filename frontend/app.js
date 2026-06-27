// Dynamic API URL Configuration
const DEFAULT_API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api/tasks'
    : window.location.origin + '/api/tasks';
let API_URL = localStorage.getItem('REMIND_TASK_API_URL') || DEFAULT_API_URL;

let localTasks = []; // Global copy of tasks
let notifiedTasks = new Set(); // Keep track of already notified tasks to avoid spamming

// 1. Toast Notification System
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    // Choose colors based on type
    let borderClass = 'border-slate-800 bg-slate-900/90 text-slate-200';
    let icon = 'info';
    let iconColor = 'text-indigo-400';
    
    if (type === 'success') {
        borderClass = 'border-emerald-500/30 bg-emerald-950/85 text-emerald-100';
        icon = 'check-circle-2';
        iconColor = 'text-emerald-400';
    } else if (type === 'error') {
        borderClass = 'border-red-500/30 bg-red-950/85 text-red-100';
        icon = 'alert-triangle';
        iconColor = 'text-red-400';
    } else if (type === 'warning') {
        borderClass = 'border-yellow-500/30 bg-yellow-950/85 text-yellow-100';
        icon = 'bell-ring';
        iconColor = 'text-yellow-400';
    }

    toast.className = `p-4 border rounded-xl flex items-center gap-3 shadow-lg backdrop-blur-md transition-all duration-500 transform translate-x-12 opacity-0 ${borderClass}`;
    toast.innerHTML = `
        <i data-lucide="${icon}" class="w-5 h-5 ${iconColor} flex-shrink-0"></i>
        <div class="text-sm font-medium">${message}</div>
    `;
    
    container.appendChild(toast);
    lucide.createIcons();
    
    // Trigger transition animation
    setTimeout(() => {
        toast.classList.remove('translate-x-12', 'opacity-0');
    }, 10);
    
    // Auto-remove toast
    setTimeout(() => {
        toast.classList.add('translate-x-12', 'opacity-0');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// 2. Request Notification Permission
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('✅ Izin notifikasi diberikan!');
                showToast('Izin notifikasi diaktifkan untuk pengingat otomatis.', 'success');
            }
        });
    }
}

// 3. Check Backend Connection Health
async function checkBackendConnection() {
    const statusDot = document.getElementById('backend-status-dot');
    const statusText = document.getElementById('backend-status-text');
    
    let baseUrl;
    try {
        baseUrl = new URL(API_URL).origin;
    } catch (e) {
        baseUrl = API_URL;
    }

    try {
        const response = await fetch(baseUrl, { method: 'GET' });
        if (response.ok) {
            statusDot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse';
            statusText.innerText = 'Connected';
            statusText.className = 'text-emerald-400 font-semibold';
            return true;
        }
    } catch (error) {
        console.error("Backend healthcheck failed:", error);
    }
    
    statusDot.className = 'w-2 h-2 rounded-full bg-rose-500';
    statusText.innerText = 'Offline / Connecting';
    statusText.className = 'text-rose-400 font-semibold';
    return false;
}

// 4. Update Stats Dashboard
function updateStats(tasks) {
    const sekarang = new Date().getTime();
    
    let total = tasks.length;
    let completed = 0;
    let approaching = 0;
    let overdue = 0;
    
    tasks.forEach(task => {
        if (task.is_completed) {
            completed++;
        } else {
            const waktuDeadline = new Date(task.deadline).getTime();
            const selisihWaktu = waktuDeadline - sekarang;
            
            if (waktuDeadline < sekarang) {
                overdue++;
            } else if (selisihWaktu > 0 && selisihWaktu <= 24 * 60 * 60 * 1000) { // 24 hours
                approaching++;
            }
        }
    });
    
    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-completed').innerText = completed;
    document.getElementById('stat-approaching').innerText = approaching;
    document.getElementById('stat-overdue').innerText = overdue;
}

// 5. READ: Retrieve tasks from database
async function getTasks() {
    const container = document.getElementById('tasks-container');
    
    try {
        await checkBackendConnection();
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Gagal mengambil data dari server");
        
        const tasks = await response.json();
        localTasks = tasks;
        updateStats(tasks);
        
        container.innerHTML = '';
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-16 text-slate-500">
                    <i data-lucide="smile" class="w-12 h-12 text-slate-600 mb-3"></i>
                    <p class="text-sm font-medium">Belum ada tugas terdaftar. Tambahkan tugas baru di sebelah kiri!</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }
        
        const sekarang = new Date().getTime();
        
        tasks.forEach(task => {
            const waktuDeadline = new Date(task.deadline).getTime();
            const selisihWaktu = waktuDeadline - sekarang;
            
            // Format Date
            const taskDate = new Date(task.deadline).toLocaleString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            let cardBorder = 'border-slate-800/80';
            let cardBg = 'bg-slate-900/30';
            let badgeClass = '';
            let badgeText = '';
            let badgeIcon = '';
            let isOverdue = false;
            
            if (task.is_completed) {
                cardBg = 'bg-slate-900/10 opacity-70';
                cardBorder = 'border-emerald-500/20';
                badgeClass = 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/25';
                badgeText = 'Selesai';
                badgeIcon = 'check-circle';
            } else if (waktuDeadline < sekarang) {
                cardBorder = 'border-rose-500/40 hover:border-rose-500/60 shadow-lg shadow-rose-950/10';
                cardBg = 'bg-rose-950/10';
                badgeClass = 'bg-rose-950/60 text-rose-400 border border-rose-500/30';
                badgeText = 'Lewat Batas Waktu';
                badgeIcon = 'alert-octagon';
                isOverdue = true;
            } else if (selisihWaktu > 0 && selisihWaktu <= 24 * 60 * 60 * 1000) {
                cardBorder = 'border-amber-500/40 hover:border-amber-500/60 shadow-lg shadow-amber-950/10';
                cardBg = 'bg-amber-950/10';
                badgeClass = 'bg-amber-950/60 text-amber-400 border border-amber-500/30';
                badgeText = 'Mendekati Batas';
                badgeIcon = 'clock';
            } else {
                cardBorder = 'border-indigo-500/20 hover:border-indigo-500/40';
                cardBg = 'bg-indigo-950/5';
                badgeClass = 'bg-indigo-950/50 text-indigo-400 border border-indigo-500/25';
                badgeText = 'Mendatang';
                badgeIcon = 'calendar';
            }
            
            const titleClass = task.is_completed ? 'line-through text-slate-500' : 'text-slate-100 font-semibold';
            const descClass = task.is_completed ? 'text-slate-600 line-through' : 'text-slate-400';
            
            const taskElement = document.createElement('div');
            taskElement.className = `glass-card p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 ${cardBg} ${cardBorder}`;
            
            taskElement.innerHTML = `
                <div class="space-y-2 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${badgeClass}">
                            <i data-lucide="${badgeIcon}" class="w-3 h-3"></i>
                            ${badgeText}
                        </span>
                    </div>
                    <h3 class="text-base md:text-lg ${titleClass}">${task.title}</h3>
                    <p class="text-xs md:text-sm ${descClass}">${task.description || 'Tidak ada deskripsi.'}</p>
                    <div class="flex items-center gap-1 text-xs ${isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-500'}">
                        <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                        <span>Deadline: ${taskDate}</span>
                    </div>
                </div>
                
                <div class="flex items-center gap-2 self-end md:self-center">
                    <button onclick="toggleComplete('${task._id}', ${task.is_completed})" class="p-2.5 rounded-xl flex items-center justify-center transition-all ${task.is_completed ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'}" title="${task.is_completed ? 'Batalkan status selesai' : 'Tandai Selesai'}">
                        <i data-lucide="${task.is_completed ? 'rotate-ccw' : 'check'}" class="w-4 h-4"></i>
                    </button>
                    <button onclick="deleteTask('${task._id}')" class="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/25 rounded-xl flex items-center justify-center transition-all" title="Hapus Tugas">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(taskElement);
        });
        
        lucide.createIcons();
    } catch (error) {
        console.error("Gagal mengambil data:", error);
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-16 text-rose-400">
                <i data-lucide="wifi-off" class="w-12 h-12 text-rose-500 mb-3"></i>
                <p class="text-sm font-medium">Gagal memuat data dari server backend.</p>
                <button onclick="getTasks()" class="mt-4 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs rounded-xl transition duration-300">
                    Coba Lagi
                </button>
            </div>
        `;
        lucide.createIcons();
    }
}

// 6. CREATE: Add new task
document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const deadline = document.getElementById('deadline').value;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, deadline })
        });

        if (response.ok) {
            document.getElementById('task-form').reset();
            showToast('Tugas baru berhasil disimpan!', 'success');
            getTasks();
        } else {
            const errData = await response.json();
            showToast(`Gagal menyimpan: ${errData.message}`, 'error');
        }
    } catch (error) {
        console.error("Gagal menambah tugas:", error);
        showToast('Gagal terhubung ke backend untuk menyimpan tugas.', 'error');
    }
});

// 7. UPDATE: Toggle task completion status
async function toggleComplete(id, currentStatus) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_completed: !currentStatus })
        });
        
        if (response.ok) {
            showToast(currentStatus ? 'Status tugas dibatalkan.' : 'Tugas berhasil diselesaikan!', 'success');
            getTasks();
        } else {
            showToast('Gagal memperbarui status tugas.', 'error');
        }
    } catch (error) {
        console.error("Gagal mengubah status:", error);
        showToast('Kesalahan koneksi saat memperbarui tugas.', 'error');
    }
}

// 8. DELETE: Delete task from system
async function deleteTask(id) {
    if (confirm('Apakah kamu yakin ingin menghapus tugas ini?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showToast('Tugas berhasil dihapus.', 'success');
                getTasks();
            } else {
                showToast('Gagal menghapus tugas.', 'error');
            }
        } catch (error) {
            console.error("Gagal menghapus tugas:", error);
            showToast('Kesalahan koneksi saat menghapus tugas.', 'error');
        }
    }
}

// 9. AUTOMATION SYSTEM: Check deadlines for push notification reminder
function checkDeadlines() {
    const sekarang = new Date().getTime();

    localTasks.forEach(task => {
        if (!task.is_completed) {
            const waktuDeadline = new Date(task.deadline).getTime();
            const selisihWaktu = waktuDeadline - sekarang;

            // Trigger notification only if deadline is in the future and less than 15 minutes (900000ms)
            if (selisihWaktu > 0 && selisihWaktu <= 900000) {
                // To avoid sending notifications repeatedly for the same task
                if (!notifiedTasks.has(task._id)) {
                    if (Notification.permission === 'granted') {
                        new Notification('🚨 Pengingat Tugas!', {
                            body: `Tugas "${task.title}" akan mendekati batas waktu (${Math.ceil(selisihWaktu / 60000)} menit lagi)!`,
                            icon: 'https://cdn-icons-png.flaticon.com/512/906/906334.png'
                        });
                        notifiedTasks.add(task._id);
                        showToast(`Notifikasi pengingat dikirim untuk: "${task.title}"`, 'warning');
                    }
                }
            }
        }
    });
}

// 10. MODAL SETTINGS INTERACTION
function toggleSettingsModal(show) {
    const modal = document.getElementById('settings-modal');
    const input = document.getElementById('settings-api-url');
    
    if (show) {
        input.value = API_URL;
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

function saveApiUrl() {
    const input = document.getElementById('settings-api-url').value.trim();
    if (input) {
        API_URL = input;
        localStorage.setItem('REMIND_TASK_API_URL', API_URL);
        showToast('Konfigurasi API berhasil diperbarui!', 'success');
        toggleSettingsModal(false);
        getTasks();
    } else {
        showToast('URL API tidak boleh kosong!', 'error');
    }
}

function resetApiUrl() {
    API_URL = DEFAULT_API_URL;
    localStorage.removeItem('REMIND_TASK_API_URL');
    showToast('Endpoint API direset ke default (localhost).', 'success');
    toggleSettingsModal(false);
    getTasks();
}

// Initialize Application
window.addEventListener('DOMContentLoaded', () => {
    // Request permission early
    setTimeout(requestNotificationPermission, 2000);
    
    // Load lists
    getTasks();
    
    // Check deadlines every 10 seconds
    setInterval(checkDeadlines, 10000);
    
    // Check connection health every 30 seconds
    setInterval(checkBackendConnection, 30000);
});