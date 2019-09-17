import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import { format } from 'date-fns';
import { faCalendar } from '@fortawesome/pro-light-svg-icons';
import { Card, CardHeader, CardContent, CardFooter, CardIcon } from '../ui/Card';
import { List, ListItem, ListItemHeader, ListItemText, ListItemContentLink } from '../ui/List';
import { getAcademicCalendarEvents, IEvents } from '../api/events';
import { Date, DateDay, DateMonth } from '../ui/Date';
import { ExternalLink } from '../ui/Link';
import Url from '../util/externalUrls.data';
import { Event } from '../util/gaTracking';

/**
 * Academic Calendar Card
 * Displays upcoming events from Localist.
 */
const AcademicCalendar = () => {
  const [calEvents, setCalEvents] = useState<IEvents>([]);
  const [calEventsLoading, setCalEventsLoading] = useState<boolean>(true);

  // Get Academic Calendar Events
  useEffect(() => {
    let isMounted = true;
    getAcademicCalendarEvents()
      .then(data => {
        if (isMounted) {
          setCalEvents(data);
          setCalEventsLoading(false);
        }
      })
      .catch(console.log);

    return () => {
      // prevents setting data on a component that has been unmounted before promise resolves
      isMounted = false;
    };
  }, []);

  return (
    <Card>
      <CardHeader
        title="Academic Calendar"
        badge={<CardIcon icon={faCalendar} count={calEvents.length < 5 ? calEvents.length : 5} />}
      />
      <CardContent>
        {/* Show upcoming calendar events if any exist, otherwise show empty state. */}
        {calEventsLoading && <Skeleton count={5} />}
        {calEvents.length ? (
          <List>
            {calEvents.slice(0, 5).map(({ title, link, pubDate }) => (
              <ListItem key={title}>
                <ListItemContentLink
                  href={link}
                  onClick={() => Event('academic-calendar', 'event clicked', link)}
                >
                  <Date>
                    <DateDay>{format(pubDate, 'D')}</DateDay>
                    <DateMonth>{format(pubDate, 'MMM')}</DateMonth>
                  </Date>
                  <ListItemText>
                    <ListItemHeader>{title}</ListItemHeader>
                  </ListItemText>
                </ListItemContentLink>
              </ListItem>
            ))}
          </List>
        ) : (
          !calEventsLoading && <EmptyState />
        )}
      </CardContent>
      <CardFooter infoButtonId="academic-calendar">
        <ExternalLink
          href={Url.events.academicCalendar}
          onClick={() => Event('academic-calendar', 'View all link')}
        >
          View academic calendar
        </ExternalLink>
      </CardFooter>
    </Card>
  );
};

// Todo: Replace with actual empty state when ready in mockups.
const EmptyState = () => <span>No Calendar Events</span>;

export default AcademicCalendar;