import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarView = ({ appointments, onSelectEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const events = appointments.map(appt => ({
    id: appt._id,
    title: `${appt.patientName} - ${appt.reason}`,
    start: new Date(appt.appointmentDate),
    end: new Date(new Date(appt.appointmentDate).setHours(new Date(appt.appointmentDate).getHours() + 1)),
    status: appt.status,
  }));

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    if (event.status === 'Completed') backgroundColor = '#4caf50';
    if (event.status === 'Cancelled') backgroundColor = '#f44336';

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <Paper sx={{ p: 2, height: 'calc(100vh - 200px)' }}>
      <Typography variant="h6" gutterBottom>
        Appointment Calendar
      </Typography>
      <Box sx={{ height: '100%' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={onSelectEvent}
          eventPropGetter={eventStyleGetter}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="week"
          min={new Date(0, 0, 0, 8, 0, 0)}
          max={new Date(0, 0, 0, 20, 0, 0)}
        />
      </Box>
    </Paper>
  );
};

export default CalendarView;