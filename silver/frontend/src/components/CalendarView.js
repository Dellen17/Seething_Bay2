import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CalendarView = ({ onDateSelect }) => {
  const [date, setDate] = useState(new Date());

  const handleDateChange = (newDate) => {
    setDate(newDate);
    onDateSelect(newDate); // Pass the selected date to parent
  };

  return (
    <div>
      <Calendar 
        onChange={handleDateChange} 
        value={date} 
      />
    </div>
  );
};

export default CalendarView;