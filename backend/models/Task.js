const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Judul tugas wajib diisi']
    },
    description: {
        type: String,
        default: ''
    },
    deadline: {
        type: Date,
        required: [true, 'Tanggal & waktu batas (deadline) wajib diisi']
    },
    is_completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Otomatis membuat kolom createdAt dan updatedAt
});

module.exports = mongoose.model('Task', TaskSchema);