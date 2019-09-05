import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getAnnouncements } from '../api/announcements';
import { getStudentExperienceEvents } from '../api/events';
import EventCard from './EventCard';

const EventCardContainerWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  grid-row-gap: 16px;
  @media screen and (min-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: 16px;
  }
`;

const EventCardContainer = ({ ...props }) => {
  const [events, setEvents] = useState<any>([]);

  // Fetch data on load
  useEffect(() => {
    let isMounted = true;

    Promise.all([getAnnouncements(''), getStudentExperienceEvents()])
      .then(promises => {
        if (isMounted) {
          const newLocalist = item => {
            return {
              id: item.event.event_instances[0].event_instance.id,
              date: item.event.event_instances[0].event_instance.start,
              title: item.event.title,
              body: null,
              bg_image: item.event.photo_url,
              action: {
                title: null,
                link: item.event.localist_url
              }
            };
          };
          for (let i = 0; i < Math.min(promises[0].length, promises[1].length); i++) {
            setEvents(prevEvents => [...prevEvents, promises[0][i], newLocalist(promises[1][i])]);
          }
          if (promises[0].length < promises[1].length) {
            for (let i = promises[0].length; i < promises[1].length; i++) {
              setEvents(prevEvents => [...prevEvents, newLocalist(promises[1][i])]);
            }
          } else if (promises[0].length > promises[1].length) {
            for (let i = promises[1].length; i < promises[0].length; i++) {
              setEvents(prevEvents => [...prevEvents, promises[0][i]]);
            }
          }
        }
      })
      .catch(console.log);

    return () => {
      isMounted = false;
    };
  }, []);

  if (!events.length) {
    return null;
  }

  return (
    <EventCardContainerWrapper {...props}>
      {events.map(item => (
        <EventCard key={item.id} itemContent={item} />
      ))}
    </EventCardContainerWrapper>
  );
};

export default EventCardContainer;
