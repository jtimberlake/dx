import React, { useContext } from 'react';
import styled from 'styled-components';
import { useAnnouncements } from '../api/announcements';
import EventCard from './EventCard';
import { breakpoints } from '../theme';

const AnnouncementContainerWrapper = styled.div`
  max-width: ${breakpoints[1024]};
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  grid-row-gap: 16px;
  @media screen and (min-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: 16px;
  }
`;

const AnnouncementContainer = ({ type, ...props }) => {
  const events = useAnnouncements(type);

  if (!events.data.length) {
    return null;
  }

  return (
    <AnnouncementContainerWrapper {...props}>
      {events.data.map(item => (
        <EventCard key={item.id} itemContent={item} />
      ))}
    </AnnouncementContainerWrapper>
  );
};

export default AnnouncementContainer;
