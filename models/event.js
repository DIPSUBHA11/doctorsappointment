const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
    selectedDate: {
        type: Date,
        required: true
    },
    timeSlots: {
        type: [Date],
        required: true
    },
    events: {
        type: [Date],
        required: true
    }
})

module.exports = mongoose.model('event', eventSchema);