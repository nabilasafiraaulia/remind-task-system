const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const TASKS_FILE = path.join(__dirname, 'tasks.json');

// --- DUAL DATABASE ADAPTER ---
let dbMode = 'json'; // default fallback

// Define Mongoose Schema & Model
const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    deadline: { type: Date, required: true },
    is_completed: { type: Boolean, default: false }
}, { timestamps: true });

let TaskModel;
try {
    TaskModel = mongoose.model('Task', TaskSchema);
} catch (e) {
    TaskModel = mongoose.model('Task');
}

// Koneksi ke MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://niraswaraa:n1r45w4r4@cluster0.ssf6oa0.mongodb.net/remind_task_db?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 4000 // timeout cepat agar fallback segera aktif jika di lokal diblokir ISP
})
.then(() => {
    dbMode = 'mongodb';
    console.log('✅ DATABASE CLOUD MONGODB ATLAS TERHUBUNG!');
})
.catch((err) => {
    dbMode = 'json';
    console.error('❌ Gagal terhubung ke MongoDB Atlas Cloud:', err.message);
    console.log('🔄 Mengaktifkan database lokal berbasis file JSON (tasks.json)...');
});

// Helper JSON File Database
function readTasksJSON() {
    try {
        if (!fs.existsSync(TASKS_FILE)) {
            fs.writeFileSync(TASKS_FILE, JSON.stringify([], null, 2));
            return [];
        }
        const data = fs.readFileSync(TASKS_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error('Gagal membaca tasks.json:', error.message);
        return [];
    }
}

function writeTasksJSON(tasks) {
    try {
        fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
    } catch (error) {
        console.error('Gagal menulis tasks.json:', error.message);
    }
}

// CORS Config
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

app.use(cors(corsOptions));
app.use(express.json());

// ==========================================
// 🔥 ENDPOINT CRUD API (DUAL MODE DB)
// ==========================================

// 1. CREATE: Menambah Tugas Baru
app.post('/api/tasks', async (req, res) => {
    try {
        const { title, description, deadline } = req.body;
        if (!title || !deadline) {
            return res.status(400).json({ message: 'Judul tugas dan deadline wajib diisi!' });
        }
        
        if (dbMode === 'mongodb') {
            const newTask = new TaskModel({ title, description, deadline });
            await newTask.save();
            return res.status(201).json(newTask);
        } else {
            const tasks = readTasksJSON();
            const newTask = {
                _id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
                title,
                description: description || '',
                deadline,
                is_completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            tasks.push(newTask);
            writeTasksJSON(tasks);
            return res.status(201).json(newTask);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. READ: Mengambil Semua Daftar Tugas
app.get('/api/tasks', async (req, res) => {
    try {
        if (dbMode === 'mongodb') {
            const tasks = await TaskModel.find().sort({ deadline: 1 });
            return res.json(tasks);
        } else {
            const tasks = readTasksJSON();
            tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
            return res.json(tasks);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. UPDATE: Mengubah Status Tugas atau Mengedit Isinya
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const { title, description, deadline, is_completed } = req.body;
        
        if (dbMode === 'mongodb') {
            const updatedTask = await TaskModel.findByIdAndUpdate(
                req.params.id,
                { title, description, deadline, is_completed },
                { new: true, runValidators: true }
            );
            if (!updatedTask) return res.status(404).json({ message: 'Tugas tidak ditemukan!' });
            return res.json(updatedTask);
        } else {
            const tasks = readTasksJSON();
            const taskIndex = tasks.findIndex(t => t._id === req.params.id);
            if (taskIndex === -1) return res.status(404).json({ message: 'Tugas tidak ditemukan!' });
            
            const updatedTask = {
                ...tasks[taskIndex],
                title: title !== undefined ? title : tasks[taskIndex].title,
                description: description !== undefined ? description : tasks[taskIndex].description,
                deadline: deadline !== undefined ? deadline : tasks[taskIndex].deadline,
                is_completed: is_completed !== undefined ? is_completed : tasks[taskIndex].is_completed,
                updatedAt: new Date().toISOString()
            };
            tasks[taskIndex] = updatedTask;
            writeTasksJSON(tasks);
            return res.json(updatedTask);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. DELETE: Menghapus Tugas
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        if (dbMode === 'mongodb') {
            const deletedTask = await TaskModel.findByIdAndDelete(req.params.id);
            if (!deletedTask) return res.status(404).json({ message: 'Tugas tidak ditemukan!' });
            return res.json({ message: 'Tugas berhasil dihapus!' });
        } else {
            const tasks = readTasksJSON();
            const filteredTasks = tasks.filter(t => t._id !== req.params.id);
            if (tasks.length === filteredTasks.length) {
                return res.status(404).json({ message: 'Tugas tidak ditemukan!' });
            }
            writeTasksJSON(filteredTasks);
            return res.json({ message: 'Tugas berhasil dihapus!' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route Uji Coba Dasar
app.get('/', (req, res) => {
    res.json({ 
        status: 'online', 
        message: 'Server Remind Task System Berhasil Berjalan!',
        dbMode,
        env: process.env.NODE_ENV || 'development'
    });
});

// Jalankan Server Lokal (Hanya jika dijalankan mandiri, bukan serverless Vercel)
if (require.main === module || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server berjalan di port ${PORT} dalam mode ${process.env.NODE_ENV || 'development'} (Database: ${dbMode})`);
    });
}

module.exports = app;