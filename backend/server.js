const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const TASKS_FILE = path.join(__dirname, 'tasks.json');

// Helper: Membaca data dari file JSON
function readTasks() {
    try {
        if (!fs.existsSync(TASKS_FILE)) {
            fs.writeFileSync(TASKS_FILE, JSON.stringify([], null, 2));
            return [];
        }
        const data = fs.readFileSync(TASKS_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error('Gagal membaca file database tasks.json:', error.message);
        return [];
    }
}

// Helper: Menulis data ke file JSON
function writeTasks(tasks) {
    try {
        fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
    } catch (error) {
        console.error('Gagal menulis ke file database tasks.json:', error.message);
    }
}

// Production CORS Configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        const isLocal = allowedOrigins.includes(origin) || 
                        /^http:\/\/localhost:\d+$/.test(origin) || 
                        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
                        
        const isProductionFrontend = process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL;
        const isVercelPreview = /\.vercel\.app$/.test(origin);

        if (isLocal || isProductionFrontend || isVercelPreview) {
            callback(null, true);
        } else {
            callback(new Error('Blocked by CORS policy!'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Inisialisasi Database File
console.log('✅ DATABASE FILE-BASED (JSON) AKTIF!');
console.log(`📂 Lokasi file: ${TASKS_FILE}`);

// ==========================================
// 🔥 ENDPOINT CRUD API (FILE-BASED STORAGE)
// ==========================================

// 1. CREATE: Menambah Tugas Baru
app.post('/api/tasks', (req, res) => {
    try {
        const { title, description, deadline } = req.body;
        if (!title || !deadline) {
            return res.status(400).json({ message: 'Judul tugas dan deadline wajib diisi!' });
        }
        
        const tasks = readTasks();
        const newTask = {
            _id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36), // ID unik mirip MongoDB _id
            title,
            description: description || '',
            deadline,
            is_completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        writeTasks(tasks);
        
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. READ: Mengambil Semua Daftar Tugas
app.get('/api/tasks', (req, res) => {
    try {
        const tasks = readTasks();
        // Urutkan berdasarkan deadline terdekat
        tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. UPDATE: Mengubah Status Tugas atau Mengedit Isinya
app.put('/api/tasks/:id', (req, res) => {
    try {
        const { title, description, deadline, is_completed } = req.body;
        const tasks = readTasks();
        const taskIndex = tasks.findIndex(t => t._id === req.params.id);
        
        if (taskIndex === -1) {
            return res.status(404).json({ message: 'Tugas tidak ditemukan!' });
        }
        
        const updatedTask = {
            ...tasks[taskIndex],
            title: title !== undefined ? title : tasks[taskIndex].title,
            description: description !== undefined ? description : tasks[taskIndex].description,
            deadline: deadline !== undefined ? deadline : tasks[taskIndex].deadline,
            is_completed: is_completed !== undefined ? is_completed : tasks[taskIndex].is_completed,
            updatedAt: new Date().toISOString()
        };
        
        tasks[taskIndex] = updatedTask;
        writeTasks(tasks);
        
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. DELETE: Menghapus Tugas
app.delete('/api/tasks/:id', (req, res) => {
    try {
        const tasks = readTasks();
        const filteredTasks = tasks.filter(t => t._id !== req.params.id);
        
        if (tasks.length === filteredTasks.length) {
            return res.status(404).json({ message: 'Tugas tidak ditemukan!' });
        }
        
        writeTasks(filteredTasks);
        res.json({ message: 'Tugas berhasil dihapus!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route Uji Coba Dasar
app.get('/', (req, res) => {
    res.json({ 
        status: 'online', 
        message: 'Server Remind Task System Berhasil Berjalan dengan Database File!',
        env: process.env.NODE_ENV || 'development'
    });
});

// Menjalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT} dalam mode ${process.env.NODE_ENV || 'development'}`);
});