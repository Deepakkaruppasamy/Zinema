import { useEffect, useMemo, useState } from 'react';

const mockTheatres = [
  {
    id: 1,
    name: 'Zinema Multiplex',
    distance: 2.1,
    area: 'City Center',
    rating: 4.5,
    amenities: [
      { label: 'IMAX' },
      { label: 'Dolby' },
      { label: 'Recliner' },
    ],
    metrics: { cleanliness: 4.6, sound: 4.7, seats: 4.4 },
    showtimes: [
      { time: '10:00 AM', capacity: 72, showId: 's_zinema_1000' },
      { time: '1:15 PM', capacity: 46, showId: 's_zinema_1315' },
      { time: '4:45 PM', capacity: 18, showId: 's_zinema_1645' },
      { time: '8:10 PM', capacity: 61, showId: 's_zinema_2010' },
    ],
  },
  {
    id: 2,
    name: 'Downtown Luxe Cinemas',
    distance: 4.0,
    area: 'Downtown',
    rating: 4.2,
    amenities: [
      { label: 'Dolby' },
      { label: '3D' },
      { label: 'F&B' },
    ],
    metrics: { cleanliness: 4.1, sound: 4.3, seats: 4.0 },
    showtimes: [
      { time: '9:40 AM', capacity: 65, showId: 's_downtown_0940' },
      { time: '12:30 PM', capacity: 55, showId: 's_downtown_1230' },
      { time: '6:10 PM', capacity: 30, showId: 's_downtown_1810' },
      { time: '9:20 PM', capacity: 12, showId: 's_downtown_2120' },
    ],
  },
];

export default function useTheatreSearch() {
  const [city, setCity] = useState('Chennai');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [format, setFormat] = useState('Any');
  const [language, setLanguage] = useState('Any');
  const [sortBy, setSortBy] = useState('distance');

  useEffect(() => {
    localStorage.setItem('theatre.filters', JSON.stringify({ city, date, format, language, sortBy }));
  }, [city, date, format, language, sortBy]);

  useEffect(() => {
    const saved = localStorage.getItem('theatre.filters');
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        setCity(obj.city || city);
        setDate(obj.date || date);
        setFormat(obj.format || format);
        setLanguage(obj.language || language);
        setSortBy(obj.sortBy || sortBy);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const theatres = useMemo(() => {
    let list = [...mockTheatres];
    if (format !== 'Any') list = list.filter(t => t.amenities.some(a => a.label === format));
    // language is a placeholder for future integration
    if (sortBy === 'distance') list.sort((a, b) => a.distance - b.distance);
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [format, sortBy]);

  return {
    state: { city, date, format, language, sortBy },
    actions: { setCity, setDate, setFormat, setLanguage, setSortBy },
    theatres,
  };
}
