const EventModel = require('../models/event');
const momenttimezone = require('moment-timezone');
const moment = require('moment');

function generateTimeSlots(startTime, endTime, interval) {
    const timeSlots = [];
    let currentTime = moment(startTime);

    while (currentTime.isSameOrBefore(endTime)) {
        timeSlots.push(currentTime.format('YYYY-MM-DDTHH:mm:ss[Z]'));
        currentTime.add(interval, 'minutes');
    }

    return timeSlots;
}

exports.getFreeSlot = async (req, res, next) => {
    try {
        //http://localhost:3000/freeslot?selectedDate=2019-11-14&timeZone=Europe/London
        const gettingDate = req.query.selectedDate;
        const selectedDate = new Date(gettingDate).toISOString().split("T")[0];
        const timeZone = req.query.timeZone;
        const slots = await EventModel.find({ selectedDate: { $eq: new Date(selectedDate) } });
        if (slots.length > 0) {
            const timeSlots = slots[0].timeSlots;
            const freeslot = timeSlots.length > 0 ? timeSlots.map(date => {
                const utcMoment = momenttimezone.utc(date);
                const convertedMoment = utcMoment.tz(timeZone);
                return convertedMoment.format('YYYY-MM-DDTHH:mm:ss');
            }) : [];
            res.status(200).json(freeslot);
        }
        else {
            const startTime = moment.utc(`${selectedDate}T10:00:00Z`);
            const endTime = moment(startTime).add(7, 'hours');
            const interval = 30;
            const timeSlots = generateTimeSlots(startTime, endTime, interval);
            const newEvent = new EventModel({
                selectedDate: new Date(selectedDate),
                timeSlots: timeSlots
            });
            newEvent.save().then(result => {
                let freeSlots = result.timeSlots.map(date => {
                    const utcMoment = momenttimezone.utc(date);
                    const convertedMoment = utcMoment.tz(timeZone);
                    return convertedMoment.format('YYYY-MM-DDTHH:mm:ss');
                })
                res.status(200).json(freeSlots);
            })
        }

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.createEvent = async (req, res, next) => {
    try {
        //http://localhost:3000/createEvent?selectedDate=2019-11-14&duration=30
        const selectedDate = req.query.selectedDate;
        let duration = parseInt(req.query.duration);
        let date = new Date(selectedDate);
        let convertedDate = date.toISOString().replace('Z', '+00:00');
        let acknowledged = false;
        while (duration > 0) {
            const event = await EventModel.findOne({ timeSlots: { $in: [convertedDate] } })
            const completeremove = await EventModel.updateOne(
                { selectedDate: event.selectedDate },
                { $pull: { timeSlots: convertedDate } }
            );
            const check = await EventModel.updateOne(
                { selectedDate: event.selectedDate },
                { $push: { events: convertedDate } }
            );
            duration = duration - 30;
            if (duration === 30) {
                convertedDate = new Date(convertedDate);
                convertedDate.setMinutes(convertedDate.getMinutes() + 30);
                convertedDate = convertedDate.toISOString().replace('Z', '+00:00');
            }
            acknowledged = completeremove.acknowledged ? true : false;
        }
        if (acknowledged) {
            res.status(200).json("created Successfully")
        }

    }
    catch (error) {
        res.status(400).json("not gonna created")
    }
}

exports.getEvent = async (req, res, next) => {
    try {
        // /getEvent?startDate=Wed%20Jul%2026%202023%2000:00:00%20GMT+0530%20(India%20Standard%20Time)&endDate=Fri%20Jul%2028%202023%2000:00:00%20GMT+0530%20(India%20Standard%20Time)
        const gettingStartDate = req.query.startDate;
        const gettingendDate = req.query.endDate;
        const startDate = new Date(gettingStartDate).toISOString().split("T")[0];
        const endDate = new Date(gettingendDate).toISOString().split("T")[0];
        let events = await EventModel.find({ selectedDate: { $gte: startDate, $lte: endDate } })
        let response = events.map((ele) => {
            return ele.events
        }).flat();
        res.status(200).json(response);
    }
    catch (error) {
        res.status(400).json("Internal server Error")
    }
}